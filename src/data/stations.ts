export type Station = {
  id: string;
  code: string;
  nameRu: string;
  nameEn: string;
  genre: string;
  freq: number;
  streamUrl: string;
  description: string;
};

/** Curated HTTPS streams mapped to Soviet channel identities */
export const STATIONS: Station[] = [
  {
    id: "volna-1",
    code: "В-1",
    nameRu: "ВОЛНА-1 · Классика",
    nameEn: "VOLNA-1 · Classics",
    genre: "Classical",
    freq: 88.1,
    streamUrl: "https://stream.radioparadise.com/aac-128",
    description: "Всемирная классика и эфирные шедевры",
  },
  {
    id: "volna-2",
    code: "В-2",
    nameRu: "ВОЛНА-2 · Джаз",
    nameEn: "VOLNA-2 · Jazz",
    genre: "Jazz",
    freq: 91.5,
    streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
    description: "Джаз, downtempo и groove salad",
  },
  {
    id: "kosmos",
    code: "КОС",
    nameRu: "КОСМОС",
    nameEn: "KOSMOS",
    genre: "Ambient",
    freq: 94.2,
    streamUrl: "https://ice1.somafm.com/dronezone-128-mp3",
    description: "Космический дрон и глубокий ambient",
  },
  {
    id: "trud",
    code: "ТРД",
    nameRu: "ТРУД",
    nameEn: "TRUD",
    genre: "Electronic",
    freq: 97.0,
    streamUrl: "https://ice1.somafm.com/defcon-128-mp3",
    description: "Электронная музыка для трудовой смены",
  },
  {
    id: "orbita",
    code: "ОРБ",
    nameRu: "ОРБИТА",
    nameEn: "ORBITA",
    genre: "Space",
    freq: 100.3,
    streamUrl: "https://ice1.somafm.com/spacestation-128-mp3",
    description: "Орбитальная станция — space music",
  },
  {
    id: "mayak",
    code: "МЯК",
    nameRu: "МАЯК · FIP",
    nameEn: "MAYAK · FIP",
    genre: "Eclectic",
    freq: 103.7,
    streamUrl: "https://icecast.radiofrance.fr/fip-midfi.mp3",
    description: "FIP — эклектика мирового эфира",
  },
  {
    id: "lush",
    code: "ЛШ",
    nameRu: "НЕЖНОСТЬ",
    nameEn: "LUSH",
    genre: "Chill",
    freq: 106.1,
    streamUrl: "https://ice1.somafm.com/lush-128-mp3",
    description: "Мягкие волны и женский вокал",
  },
  {
    id: "deep",
    code: "ГЛБ",
    nameRu: "ГЛУБИНА",
    nameEn: "DEPTH",
    genre: "Deep Space",
    freq: 108.0,
    streamUrl: "https://ice1.somafm.com/deepspaceone-128-mp3",
    description: "Глубокий космос — deep space one",
  },
];

export function getStationById(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
