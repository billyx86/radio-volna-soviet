import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../store/player";
import { createVuFlicker } from "../lib/vu";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  // Monotonic token: each play() run checks it before every await, so a
  // stale run (user retuned mid-load) aborts instead of clobbering the
  // newer run's element/status.
  const playTokenRef = useRef(0);
  // Simulated VU flicker, re-seeded per station (deterministic per id —
  // see src/lib/vu.ts). Replacing the old per-frame Math.random().
  const vuFlickerRef = useRef<{ id: string; fn: () => number }>({
    id: "",
    fn: () => 0,
  });

  const station = usePlayerStore((s) => s.station);
  const status = usePlayerStore((s) => s.status);
  const volume = usePlayerStore((s) => s.volume);
  const powered = usePlayerStore((s) => s.powered);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setVuLevel = usePlayerStore((s) => s.setVuLevel);
  const setDialFreq = usePlayerStore((s) => s.setDialFreq);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.preload = "none";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const setupAnalyser = useCallback((el: HTMLAudioElement) => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(el);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      }
    } catch {
      // CORS or Web Audio blocked — VU falls back to simulated levels
      analyserRef.current = null;
    }
  }, []);

  const tickVu = useCallback(() => {
    const analyser = analyserRef.current;
    const playing = usePlayerStore.getState().status === "playing";
    if (analyser && playing) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] ?? 0;
      const avg = sum / data.length / 255;
      setVuLevel(Math.min(1, avg * 1.8));
    } else if (playing) {
      // Simulated needle flicker when analyser unavailable. Lazily
      // (re)seed the PRNG when the station changes so each channel's
      // needle behaviour is stable and testable.
      const stId = usePlayerStore.getState().station.id;
      if (vuFlickerRef.current.id !== stId) {
        vuFlickerRef.current = { id: stId, fn: createVuFlicker(stId) };
      }
      setVuLevel(vuFlickerRef.current.fn());
    } else {
      setVuLevel(0);
    }
    rafRef.current = requestAnimationFrame(tickVu);
  }, [setVuLevel]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tickVu);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tickVu]);

  useEffect(() => {
    const el = ensureAudio();
    el.volume = volume;
  }, [volume, ensureAudio]);

  const play = useCallback(async () => {
    if (!powered) return;
    const el = ensureAudio();
    const st = usePlayerStore.getState().station;
    const token = ++playTokenRef.current;
    // Bail out of this run if a newer play() started after any await.
    const stale = () => playTokenRef.current !== token;

    setStatus("tuning");
    // Animate dial sweep briefly
    const start = st.freq - 2;
    const end = st.freq;
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      if (stale()) return;
      setDialFreq(start + ((end - start) * i) / steps);
      await new Promise((r) => setTimeout(r, 30));
    }
    if (stale()) return;

    setStatus("buffering");
    try {
      el.pause();
      el.src = st.streamUrl;
      el.load();
      setupAnalyser(el);

      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("stream error"));
        };
        const cleanup = () => {
          el.removeEventListener("canplay", onCanPlay);
          el.removeEventListener("error", onError);
        };
        el.addEventListener("canplay", onCanPlay);
        el.addEventListener("error", onError);
        // Timeout for slow streams
        setTimeout(() => {
          cleanup();
          resolve();
        }, 8000);
      });
      // A newer play() started while we were buffering — the stale run
      // must not touch the element or status again.
      if (stale()) return;

      await el.play();
      if (stale()) return;
      setStatus("playing");
    } catch {
      if (stale()) return;
      setStatus("error", "СВЯЗЬ ПРЕРВАНА · SIGNAL LOST");
      setVuLevel(0);
    }
  }, [powered, ensureAudio, setStatus, setDialFreq, setupAnalyser, setVuLevel]);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
    }
    setStatus("paused");
    setVuLevel(0);
  }, [setStatus, setVuLevel]);

  const toggle = useCallback(() => {
    if (!powered) return;
    if (status === "playing") {
      pause();
    } else {
      void play();
    }
  }, [powered, status, play, pause]);

  // Retune when station changes while powered
  useEffect(() => {
    if (!powered) return;
    if (status === "playing" || status === "tuning" || status === "buffering") {
      void play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.id]);

  useEffect(() => {
    if (!powered) {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
      }
      setVuLevel(0);
    }
  }, [powered, setVuLevel]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = "";
      }
      void ctxRef.current?.close();
    };
  }, []);

  return { play, pause, toggle, audioRef };
}
