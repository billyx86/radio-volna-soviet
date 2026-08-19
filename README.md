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
