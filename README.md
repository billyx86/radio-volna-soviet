# Радио Волна — Radio Volna

Soviet-style **working internet radio** web app. Crimson steel chassis, gold brass, CRT green dial, bakelite knobs — streams real live stations.

[![CI](https://github.com/billyx86/radio-volna-soviet/actions/workflows/ci.yml/badge.svg)](https://github.com/billyx86/radio-volna-soviet/actions/workflows/ci.yml)

## Quick play (no install)

Open the standalone console:

**[radio.html](./radio.html)** — single file, open in any browser.

Or serve the Vite app:

```bash
npm install
npm run dev
```

Runs on `0.0.0.0:8080`.

## Stations (live HTTPS streams)

| Channel | Stream |
|---------|--------|
| **ВОЛНА-1 · Классика** | Radio Paradise |
| **ВОЛНА-2 · Джаз** | SomaFM Groove Salad |
| **КОСМОС** | SomaFM Drone Zone |
| **ТРУД** | SomaFM DEF CON |
| **ОРБИТА** | SomaFM Space Station |
| **МАЯК · FIP** | Radio France FIP |
| **НЕЖНОСТЬ** | SomaFM Lush |
| **ГЛУБИНА** | SomaFM Deep Space One |

## Controls

- **ВКЛ / ВЫКЛ** — power
- **ПУСК / СТОП** — play / pause
- **Channel buttons** — retune
- **Volume dial** — volume (saved)
- **★** — favorites (localStorage); **★ ИЗБРАННОЕ** — show favorites only

Status messages bilingual RU/EN. On stream failure: **СВЯЗЬ ПРЕРВАНА**.

Channel list is keyboard-operable: focus a channel (or the tuned one) and
use **↑ / ↓ / Home / End** to scan the dial — selection retunes on the fly.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # typecheck + vite build
```

### Station data

`src/data/stations.ts` is the single source of truth. The standalone
`radio.html` embeds its own copy (it has no build step and must work from
`file://`), so regenerate it after editing stations:

```bash
npm run sync:stations
```

CI fails if the two ever drift (`npm run sync:stations:check`).
