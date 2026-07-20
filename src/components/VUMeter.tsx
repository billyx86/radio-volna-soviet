import { usePlayerStore } from "../store/player";

export function VUMeter({ label }: { label: string }) {
  const vuLevel = usePlayerStore((s) => s.vuLevel);
  const status = usePlayerStore((s) => s.status);
  const powered = usePlayerStore((s) => s.powered);

  const bars = 12;
  const active = powered && status === "playing";
  const lit = active ? Math.round(vuLevel * bars) : 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] gold-engrave opacity-80">{label}</span>
      <div className="flex items-end gap-0.5 h-14 px-1.5 py-1 metal-dark rounded brass-rim">
        {Array.from({ length: bars }).map((_, i) => {
          const isLit = i < lit;
          const hot = i >= bars - 2;
          return (
            <div
              key={i}
              className="w-1.5 rounded-sm transition-all duration-75"
              style={{
                height: `${18 + i * 5}%`,
                background: isLit
                  ? hot
                    ? "#ff3333"
                    : i >= bars - 4
                      ? "#e8c547"
                      : "#33cc55"
                  : "#1a1c1f",
                boxShadow: isLit
                  ? hot
                    ? "0 0 4px #ff3333"
                    : "0 0 3px #33cc5588"
                  : "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
