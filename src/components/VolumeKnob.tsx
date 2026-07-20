import { usePlayerStore } from "../store/player";

export function VolumeKnob() {
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const powered = usePlayerStore((s) => s.powered);

  const rotation = -135 + volume * 270;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] gold-engrave">ГРОМКОСТЬ · VOL</span>
      <div className="relative">
        <div
          className="knob-face w-16 h-16 sm:w-20 sm:h-20 rounded-full relative"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Indicator mark */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-700" />
          {/* Ridges */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 w-0.5 h-full origin-center"
              style={{
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
              }}
            >
              <div className="w-full h-1.5 bg-black/30 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono text-yellow-600/80 mt-1">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        disabled={!powered}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="soviet-slider w-24 sm:w-28"
        aria-label="Громкость"
      />
    </div>
  );
}
