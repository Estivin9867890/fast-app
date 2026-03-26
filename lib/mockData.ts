export type Theme =
  | "Restaurant"
  | "Personnalité"
  | "Lieu Touristique"
  | "Film & Série"
  | "Musique"
  | "Objet"
  | "Expérience"
  | "Autre";

export interface Rating {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  theme: Theme;
  score: number;
  comment: string;
  photo_url: string;
  lat?: number | null;
  lng?: number | null;
  author: string;
  avatar: string;
}

export const mockRatings: Rating[] = [
  {
    id: "1",
    created_at: "2026-03-20T14:32:00Z",
    user_id: "u1",
    title: "Glace Pistache Amorino",
    theme: "Restaurant",
    score: 9,
    comment: "Crémeux, intense, et la boule en pétale c'est du génie.",
    photo_url: "https://images.unsplash.com/photo-1567206563114-c179706d9d5e?w=800&q=80",
    lat: 48.8566,
    lng: 2.3522,
    author: "Sophie L.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=sophie",
  },
  {
    id: "2",
    created_at: "2026-03-21T09:15:00Z",
    user_id: "u2",
    title: "Mon ex",
    theme: "Personnalité",
    score: 3,
    comment: "Bonne cuisine, mauvais timing. 3/10 ne pas recommander.",
    photo_url: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=800&q=80",
    lat: 48.8742,
    lng: 2.347,
    author: "Tom R.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=tom",
  },
  {
    id: "3",
    created_at: "2026-03-22T18:00:00Z",
    user_id: "u3",
    title: "Napoléon Bonaparte",
    theme: "Personnalité",
    score: 7,
    comment: "Grande vision, ego surdimensionné. Le code civil reste utile.",
    photo_url: "https://images.unsplash.com/photo-1602228551089-2f8a6e0e2b31?w=800&q=80",
    lat: 48.8529,
    lng: 2.3499,
    author: "Marie C.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=marie",
  },
  {
    id: "4",
    created_at: "2026-03-22T20:45:00Z",
    user_id: "u4",
    title: "Interstellar",
    theme: "Film & Série",
    score: 10,
    comment: "Le son, l'espace, Hans Zimmer. C'est parfait, point.",
    photo_url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
    lat: 48.86,
    lng: 2.355,
    author: "Alex K.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=alex",
  },
  {
    id: "5",
    created_at: "2026-03-23T11:30:00Z",
    user_id: "u5",
    title: "Café Verlet — Paris 1er",
    theme: "Restaurant",
    score: 8,
    comment: "Les meilleurs expresso de Paris. Torréfacteur depuis 1880.",
    photo_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    lat: 48.8636,
    lng: 2.3378,
    author: "Julie P.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=julie",
  },
  {
    id: "6",
    created_at: "2026-03-23T16:00:00Z",
    user_id: "u6",
    title: "iPhone 16 Pro",
    theme: "Objet",
    score: 6,
    comment: "L'appareil photo est incroyable. Le prix, beaucoup moins.",
    photo_url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80",
    lat: 48.868,
    lng: 2.308,
    author: "Karim B.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=karim",
  },
  {
    id: "7",
    created_at: "2026-03-24T08:00:00Z",
    user_id: "u7",
    title: "Festival We Love Green",
    theme: "Expérience",
    score: 9,
    comment: "La programmation, le cadre, l'ambiance. On y retourne chaque année.",
    photo_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    lat: 48.833,
    lng: 2.396,
    author: "Nora M.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=nora",
  },
  {
    id: "8",
    created_at: "2026-03-24T10:20:00Z",
    user_id: "u8",
    title: "Croissant — Blé Sucré",
    theme: "Restaurant",
    score: 10,
    comment: "Le meilleur croissant de Paris. Aucun débat possible.",
    photo_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
    lat: 48.849,
    lng: 2.377,
    author: "Pierre D.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=pierre",
  },
  {
    id: "9",
    created_at: "2026-03-24T13:00:00Z",
    user_id: "u9",
    title: "Tour Eiffel",
    theme: "Lieu Touristique",
    score: 8,
    comment: "Cliché mais toujours impressionnant de nuit. Le fait d'y vivre rend les touristes adorables.",
    photo_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80",
    lat: 48.8584,
    lng: 2.2945,
    author: "Lucie F.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=lucie",
  },
  {
    id: "10",
    created_at: "2026-03-24T15:45:00Z",
    user_id: "u10",
    title: "Daft Punk — Random Access Memories",
    theme: "Musique",
    score: 10,
    comment: "Get Lucky seul justifie un 10/10. Le reste c'est du bonus.",
    photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    lat: 48.88,
    lng: 2.35,
    author: "Hugo V.",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=hugo",
  },
];

export const THEMES: Theme[] = [
  "Restaurant",
  "Personnalité",
  "Lieu Touristique",
  "Film & Série",
  "Musique",
  "Objet",
  "Expérience",
  "Autre",
];

export const THEME_META: Record<
  Theme,
  { emoji: string; color: string; cover: string }
> = {
  Restaurant: {
    emoji: "🍴",
    color: "#f97316",
    cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  },
  Personnalité: {
    emoji: "👤",
    color: "#8b5cf6",
    cover: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80",
  },
  "Lieu Touristique": {
    emoji: "📍",
    color: "#06b6d4",
    cover: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&q=80",
  },
  "Film & Série": {
    emoji: "🎬",
    color: "#ec4899",
    cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
  },
  Musique: {
    emoji: "🎵",
    color: "#10b981",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
  },
  Objet: {
    emoji: "📦",
    color: "#3b82f6",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  },
  Expérience: {
    emoji: "✨",
    color: "#f59e0b",
    cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
  },
  Autre: {
    emoji: "🌀",
    color: "#6b7280",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
};
