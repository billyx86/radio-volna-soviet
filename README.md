# Радио Волна (Radio Volna)

Soviet-style internet radio console. Streams live public HTTPS radio stations through a vintage 1970s shortwave receiver UI.

## Run

```bash
npm install
npm run dev
```

Opens on `0.0.0.0:8080`.

## Stations

| Channel | Stream |
|---------|--------|
| ВОЛНА-1 · Классика | Radio Paradise |
| ВОЛНА-2 · Джаз | SomaFM Groove Salad |
| КОСМОС | SomaFM Drone Zone |
| ТРУД | SomaFM DEF CON |
| ОРБИТА | SomaFM Space Station |
| МАЯК · FIP | Radio France FIP |
| НЕЖНОСТЬ | SomaFM Lush |
| ГЛУБИНА | SomaFM Deep Space One |

## Features

- Real HTML5 Audio streaming
- Frequency dial animation
- VU meters (Web Audio API with graceful fallback)
- Volume dial + favorites (localStorage)
- Bilingual Russian / English UI
- Power on/off, play/pause, error states («СВЯЗЬ ПРЕРВАНА»)
