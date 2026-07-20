import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../store/player";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

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
      // Simulated needle flicker when analyser unavailable
      setVuLevel(0.35 + Math.random() * 0.45);
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

    setStatus("tuning");
    // Animate dial sweep briefly
    const start = st.freq - 2;
    const end = st.freq;
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      setDialFreq(start + ((end - start) * i) / steps);
      await new Promise((r) => setTimeout(r, 30));
    }

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

      await el.play();
      setStatus("playing");
    } catch {
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
