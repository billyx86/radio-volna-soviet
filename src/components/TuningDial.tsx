import type { CSSProperties } from "react";
import { usePlayerStore } from "../store/player";

export function TuningDial() {
  const dialFreq = usePlayerStore((s) => s.dialFreq);
  const status = usePlayerStore((s) => s.status);
  const powered = usePlayerStore((s) => s.powered);

  const angle = ((dialFreq - 88) / 20) * 120 - 60;
  const glow = powered && (status === "playing" || status === "tuning");

  const ticks: number[] = [];
  for (let f = 88; f <= 108; f += 2) {
    ticks.push(f);
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div
        className={`dial-face relative rounded-lg brass-rim overflow-hidden scanlines h-28 sm:h-32 ${
          glow ? "ring-1 ring-green-500/30" : ""
        }`}
      >
        <div className="absolute inset-x-3 top-3 flex justify-between">
          {ticks.map((f) => (
            <div key={f} className="flex flex-col items-center">
              <div
                className="w-px h-2"
                style={{ background: glow ? "#33ff66aa" : "#556655" }}
              />
              <span
                className={`text-[9px] sm:text-[10px] mt-0.5 font-mono ${
                  glow ? "crt-glow" : "text-gray-600"
                }`}
              >
                {f}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute top-1 left-1/2 -translate-x-1/2">
          <span className="text-[9px] gold-engrave opacity-70">МГц · MHz</span>
        </div>

        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span
            className={`text-2xl sm:text-3xl font-mono tracking-widest ${
              powered ? "crt-glow" : "text-gray-700"
            }`}
          >
            {powered ? dialFreq.toFixed(1) : "--.-"}
          </span>
        </div>

        {powered && (
          <div
            className="absolute bottom-0 left-1/2 w-0.5 h-16 sm:h-20 origin-bottom needle-anim"
            style={
              {
                "--needle-angle": `${angle}deg`,
                transform: `rotate(${angle}deg)`,
                background:
                  "linear-gradient(to top, #c41e1e, #ff4444 80%, transparent)",
                boxShadow: "0 0 6px #ff2020",
              } as CSSProperties
            }
          />
        )}

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-900 border border-yellow-500/50" />
      </div>
    </div>
  );
}
