import { STATIONS } from "../data/stations";
import { usePlayerStore } from "../store/player";
import { Star } from "lucide-react";
import { isChannelNavKey, nextChannelIndex } from "../lib/keyboard";

export function StationList() {
  const station = usePlayerStore((s) => s.station);
  const setStation = usePlayerStore((s) => s.setStation);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const favOnly = usePlayerStore((s) => s.favOnly);
  const toggleFavOnly = usePlayerStore((s) => s.toggleFavOnly);
  const powered = usePlayerStore((s) => s.powered);
  const status = usePlayerStore((s) => s.status);

  const visible = favOnly
    ? STATIONS.filter((s) => favorites.includes(s.id) || station.id === s.id)
    : STATIONS;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isChannelNavKey(e.key) || !powered) return;
    const activeIdx = visible.findIndex((s) => s.id === station.id);
    const next = nextChannelIndex(e.key, activeIdx, visible.length);
    if (next < 0 || next === activeIdx) return;
    e.preventDefault();
    const target = visible[next];
    if (!target) return;
    setStation(target);
    // Focus follows selection — requestAnimationFrame so the button is in
    // the DOM for the same paint (favOnly filtering can re-render it).
    requestAnimationFrame(() => {
      document
        .getElementById(`channel-${target.id}`)
        ?.focus({ preventScroll: true });
    });
  };

  return (
    <div
      role="group"
      aria-label="КАНАЛЫ · CHANNELS"
      onKeyDown={onKeyDown}
      className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1"
    >
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] gold-engrave">КАНАЛЫ · CHANNELS</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavOnly}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-colors ${
              favOnly
                ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                : "border-yellow-900/50 text-yellow-700/70 hover:text-yellow-500"
            }`}
            aria-pressed={favOnly}
          >
            ★ ИЗБРАННОЕ
          </button>
          <span className="text-[9px] text-yellow-700/70 font-mono">
            {visible.length} УКВ
          </span>
        </div>
      </div>
      {visible.length === 0 && (
        <div className="text-[10px] text-yellow-700/60 font-mono px-2 py-3 text-center">
          Нет избранного — нажмите ★ у канала
        </div>
      )}
      {visible.map((s) => {
        const active = station.id === s.id;
        const fav = favorites.includes(s.id);
        return (
          <div key={s.id} className="flex items-stretch gap-1">
            <button
              type="button"
              id={`channel-${s.id}`}
              disabled={!powered}
              onClick={() => setStation(s)}
              // Roving tabindex: only the tuned channel is a tab stop;
              // ArrowUp/ArrowDown/Home/End (handled by the group) move
              // focus and retune, so the list is fully keyboard-driven.
              tabIndex={active ? 0 : -1}
              aria-pressed={active}
              className={`channel-btn flex-1 text-left px-3 py-2.5 rounded-sm min-h-[48px] ${
                active ? "active" : ""
              } ${!powered ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-yellow-600/90 w-8 shrink-0">
                  {s.code}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate leading-tight">
                    {s.nameRu}
                  </div>
                  <div className="text-[10px] opacity-60 truncate">
                    {s.nameEn} · {s.freq.toFixed(1)} МГц
                  </div>
                </div>
                {active && status === "playing" && (
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#33ff66] animate-pulse shrink-0" />
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(s.id)}
              className="channel-btn px-2 rounded-sm flex items-center justify-center"
              aria-label={fav ? "Убрать из избранного" : "В избранное"}
            >
              <Star
                className={`w-4 h-4 ${
                  fav ? "fill-yellow-500 text-yellow-500" : "text-yellow-800"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
