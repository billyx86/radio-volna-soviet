import { STATIONS } from "../data/stations";
import { usePlayerStore } from "../store/player";
import { Star } from "lucide-react";

export function StationList() {
  const station = usePlayerStore((s) => s.station);
  const setStation = usePlayerStore((s) => s.setStation);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const powered = usePlayerStore((s) => s.powered);
  const status = usePlayerStore((s) => s.status);

  return (
    <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] gold-engrave">КАНАЛЫ · CHANNELS</span>
        <span className="text-[9px] text-yellow-700/70 font-mono">
          {STATIONS.length} УКВ
        </span>
      </div>
      {STATIONS.map((s) => {
        const active = station.id === s.id;
        const fav = favorites.includes(s.id);
        return (
          <div key={s.id} className="flex items-stretch gap-1">
            <button
              type="button"
              disabled={!powered}
              onClick={() => setStation(s)}
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
