import { create } from "zustand";
import { STATIONS, type Station } from "../data/stations";

export type PlayerStatus =
  | "idle"
  | "tuning"
  | "buffering"
  | "playing"
  | "paused"
  | "error";

const FAV_KEY = "radio-volna-favorites";
const VOL_KEY = "radio-volna-volume";

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function loadVolume(): number {
  if (typeof window === "undefined") return 0.7;
  try {
    const raw = localStorage.getItem(VOL_KEY);
    if (raw == null) return 0.7;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.7;
  } catch {
    return 0.7;
  }
}

type PlayerState = {
  station: Station;
  status: PlayerStatus;
  volume: number;
  favorites: string[];
  errorMessage: string | null;
  dialFreq: number;
  vuLevel: number;
  powered: boolean;
  setStation: (station: Station) => void;
  setStatus: (status: PlayerStatus, errorMessage?: string | null) => void;
  setVolume: (volume: number) => void;
  toggleFavorite: (id: string) => void;
  setDialFreq: (freq: number) => void;
  setVuLevel: (level: number) => void;
  setPowered: (on: boolean) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  station: STATIONS[0]!,
  status: "idle",
  volume: loadVolume(),
  favorites: loadFavorites(),
  errorMessage: null,
  dialFreq: STATIONS[0]!.freq,
  vuLevel: 0,
  powered: true,
  setStation: (station) =>
    set({
      station,
      dialFreq: station.freq,
      status: "tuning",
      errorMessage: null,
    }),
  setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
  setVolume: (volume) => {
    const v = Math.min(1, Math.max(0, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem(VOL_KEY, String(v));
    }
    set({ volume: v });
  },
  toggleFavorite: (id) => {
    const current = get().favorites;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    if (typeof window !== "undefined") {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    }
    set({ favorites: next });
  },
  setDialFreq: (freq) => set({ dialFreq: freq }),
  setVuLevel: (level) => set({ vuLevel: level }),
  setPowered: (on) =>
    set({
      powered: on,
      status: on ? "idle" : "paused",
      vuLevel: on ? get().vuLevel : 0,
    }),
}));
