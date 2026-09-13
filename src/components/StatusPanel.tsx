import { usePlayerStore } from "../store/player";

const STATUS_MAP: Record<
  string,
  { ru: string; en: string; color: string }
> = {
  idle: { ru: "ГОТОВ", en: "STANDBY", color: "#c9a227" },
  tuning: { ru: "НАСТРОЙКА", en: "TUNING", color: "#e8c547" },
  buffering: { ru: "ПРИЁМ", en: "BUFFERING", color: "#66aaff" },
  playing: { ru: "В ЭФИРЕ", en: "ON AIR", color: "#33ff66" },
  paused: { ru: "ПАУЗА", en: "PAUSED", color: "#888" },
  error: { ru: "СВЯЗЬ ПРЕРВАНА", en: "SIGNAL LOST", color: "#ff3333" },
};

export function StatusPanel() {
  const status = usePlayerStore((s) => s.status);
  const errorMessage = usePlayerStore((s) => s.errorMessage);
  const station = usePlayerStore((s) => s.station);
  const powered = usePlayerStore((s) => s.powered);

  const info = powered
    ? STATUS_MAP[status] ?? STATUS_MAP.idle!
    : { ru: "ВЫКЛ", en: "OFF", color: "#444" };

  return (
    <div className="metal-dark rounded brass-rim p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] gold-engrave">СОСТОЯНИЕ · STATUS</span>
        <div className="flex items-center gap-2">
          <div className={`led-power ${powered && status === "playing" ? "on" : ""}`} />
          <span className="text-[9px] font-mono text-red-400/80">ПИТАНИЕ</span>
        </div>
      </div>
      {/* aria-live so screen readers announce state changes (tuning, on air,
          signal lost, off) — the visual text alone is silent to AT users. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-lg sm:text-xl tracking-wider"
        style={{
          color: info.color,
          textShadow: powered ? `0 0 8px ${info.color}88` : "none",
        }}
      >
        {info.ru}
        <span className="sr-only"> / {info.en}</span>
      </div>
      <div className="text-[11px] opacity-50 font-mono mt-0.5">{info.en}</div>
      {powered && (
        <div className="mt-3 pt-2 border-t border-yellow-900/30">
          <div className="text-sm text-yellow-100/90 font-medium truncate">
            {station.nameRu}
          </div>
          <div className="text-[11px] text-yellow-700/70 truncate">
            {station.description}
          </div>
        </div>
      )}
      {status === "error" && errorMessage && (
        <div
          role="alert"
          className="mt-2 text-xs text-red-400 font-mono animate-pulse"
        >
          ⚠ {errorMessage}
        </div>
      )}
    </div>
  );
}
