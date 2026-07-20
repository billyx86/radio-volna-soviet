import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { usePlayerStore } from "../store/player";
import { RedStar } from "./RedStar";
import { TuningDial } from "./TuningDial";
import { VolumeKnob } from "./VolumeKnob";
import { StationList } from "./StationList";
import { VUMeter } from "./VUMeter";
import { StatusPanel } from "./StatusPanel";
import { Power, Play, Pause } from "lucide-react";

export function RadioConsole() {
  const { toggle } = useAudioPlayer();
  const status = usePlayerStore((s) => s.status);
  const powered = usePlayerStore((s) => s.powered);
  const setPowered = usePlayerStore((s) => s.setPowered);
  const station = usePlayerStore((s) => s.station);

  const isPlaying = status === "playing";
  const isBusy = status === "tuning" || status === "buffering";

  return (
    <div className="min-h-dvh w-full ambient-grid flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Outer chassis */}
      <div className="w-full max-w-5xl metal-panel rounded-lg sm:rounded-xl relative overflow-hidden">
        {/* Rivets corners */}
        <div className="absolute top-3 left-3 rivet z-10" />
        <div className="absolute top-3 right-3 rivet z-10" />
        <div className="absolute bottom-3 left-3 rivet z-10" />
        <div className="absolute bottom-3 right-3 rivet z-10" />

        {/* Header plate */}
        <header className="crimson-plate px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-yellow-800/40">
          <div className="flex items-center gap-3">
            <RedStar className="w-7 h-7 sm:w-9 sm:h-9" />
            <div>
              <h1 className="gold-engrave text-xl sm:text-3xl leading-none">
                Радио Волна
              </h1>
              <p className="text-[10px] sm:text-xs text-yellow-200/50 tracking-[0.2em] font-mono mt-0.5">
                RADIO VOLNA · УКВ ПРИЁМНИК · 1974
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`led-power ${powered ? "on" : ""}`} />
            <button
              type="button"
              onClick={() => setPowered(!powered)}
              className={`channel-btn flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs ${
                powered ? "active" : ""
              }`}
              aria-label={powered ? "Выключить" : "Включить"}
            >
              <Power className="w-4 h-4" />
              <span className="hidden sm:inline">{powered ? "ВКЛ" : "ВЫКЛ"}</span>
            </button>
          </div>
        </header>

        {/* Main body */}
        <div className="p-3 sm:p-5 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-5">
          {/* Left: dial + controls */}
          <div className="flex flex-col gap-4">
            <TuningDial />

            <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end">
              <VUMeter label="УР. · L" />

              {/* Play control */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={!powered || isBusy}
                  onClick={toggle}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full channel-btn flex items-center justify-center ${
                    isPlaying ? "active" : ""
                  } ${!powered ? "opacity-40" : ""}`}
                  aria-label={isPlaying ? "Пауза" : "Играть"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-yellow-300" fill="currentColor" />
                  ) : (
                    <Play className="w-7 h-7 text-yellow-300 ml-0.5" fill="currentColor" />
                  )}
                  {isBusy && (
                    <span className="absolute inset-0 rounded-full border-2 border-yellow-500/50 animate-ping" />
                  )}
                </button>
                <span className="text-[10px] gold-engrave">
                  {isBusy ? "…" : isPlaying ? "СТОП" : "ПУСК"}
                </span>
              </div>

              <VolumeKnob />
            </div>

            <StatusPanel />

            {/* Manufacturer plaque */}
            <div className="hidden sm:flex items-center justify-between px-2 opacity-40">
              <span className="text-[9px] font-mono tracking-wider">
                ЗАВОД «ЭЛЕКТРОН» · МОДЕЛЬ РВ-74
              </span>
              <span className="text-[9px] font-mono">№ {station.code}-0847</span>
            </div>
          </div>

          {/* Right: station selector */}
          <div className="metal-dark rounded brass-rim p-3 sm:p-4">
            <StationList />
          </div>
        </div>

        {/* Footer strip */}
        <footer className="px-4 sm:px-6 py-2 border-t border-black/40 flex items-center justify-between text-[9px] sm:text-[10px] text-yellow-800/60 font-mono">
          <span>★ СЛУШАЙ · РАБОТАЙ · СТРОЙ ★</span>
          <span className="hidden sm:inline">LIVE INTERNET STREAMS</span>
          <span>СССР · 1974</span>
        </footer>
      </div>

      {/* Ambient note for mobile */}
      <p className="mt-3 text-[10px] text-yellow-900/50 text-center max-w-md px-4 font-mono">
        Нажмите ПУСК для приёма · Press PLAY to tune in
      </p>
    </div>
  );
}
