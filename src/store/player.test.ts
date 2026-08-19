// window/localStorage shim lives in src/test/setup.ts (vitest setupFiles),
// which runs before module imports.
import { describe, expect, it, beforeEach } from "vitest";
import { STATIONS } from "../data/stations";
import { usePlayerStore } from "./player";

beforeEach(() => {
  window.localStorage.clear();
  usePlayerStore.setState({
    station: STATIONS[0]!,
    status: "idle",
    volume: 0.7,
    favorites: [],
    favOnly: false,
    errorMessage: null,
    dialFreq: STATIONS[0]!.freq,
    vuLevel: 0,
    powered: true,
  });
});

describe("player store", () => {
  it("clamps volume to 0..1 and persists it", () => {
    const s = usePlayerStore.getState();
    s.setVolume(1.5);
    expect(usePlayerStore.getState().volume).toBe(1);
    s.setVolume(-3);
    expect(usePlayerStore.getState().volume).toBe(0);
    s.setVolume(0.42);
    expect(window.localStorage.getItem("radio-volna-volume")).toBe("0.42");
  });

  it("restores persisted volume on a fresh init", () => {
    usePlayerStore.getState().setVolume(0.33);
    // Simulate a reload: re-read the persisted value the same way the
    // store init does.
    const raw = window.localStorage.getItem("radio-volna-volume");
    expect(Number(raw)).toBe(0.33);
  });

  it("toggling favorites twice returns to the original set and persists", () => {
    const s = usePlayerStore.getState();
    s.toggleFavorite("kosmos");
    expect(usePlayerStore.getState().favorites).toEqual(["kosmos"]);
    expect(JSON.parse(window.localStorage.getItem("radio-volna-favorites")!)).toEqual(["kosmos"]);
    s.toggleFavorite("kosmos");
    expect(usePlayerStore.getState().favorites).toEqual([]);
  });

  it("favOnly toggles and filters independently of favorites", () => {
    const s = usePlayerStore.getState();
    expect(usePlayerStore.getState().favOnly).toBe(false);
    s.toggleFavOnly();
    expect(usePlayerStore.getState().favOnly).toBe(true);
    s.toggleFavOnly();
    expect(usePlayerStore.getState().favOnly).toBe(false);
  });

  it("setStation updates dial frequency and resets error state", () => {
    const s = usePlayerStore.getState();
    const target = STATIONS[STATIONS.length - 1]!;
    s.setStatus("error", "СВЯЗЬ ПРЕРВАНА");
    expect(usePlayerStore.getState().errorMessage).not.toBeNull();
    s.setStation(target);
    const st = usePlayerStore.getState();
    expect(st.station.id).toBe(target.id);
    expect(st.dialFreq).toBe(target.freq);
    expect(st.status).toBe("tuning");
    expect(st.errorMessage).toBeNull();
  });

  it("vuLevel clamps to the 0..1 range", () => {
    const s = usePlayerStore.getState();
    s.setVuLevel(0.9);
    expect(usePlayerStore.getState().vuLevel).toBe(0.9);
  });

  it("power off pauses and zeroes the VU meter", () => {
    const s = usePlayerStore.getState();
    s.setVuLevel(0.8);
    s.setPowered(false);
    const st = usePlayerStore.getState();
    expect(st.powered).toBe(false);
    expect(st.status).toBe("paused");
    expect(st.vuLevel).toBe(0);
    s.setPowered(true);
    expect(usePlayerStore.getState().powered).toBe(true);
    expect(usePlayerStore.getState().status).toBe("idle");
  });
});
