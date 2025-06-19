// src/types/index.ts

export type TabKey = 'swipe' | 'artistes' | 'nouvelles' | 'profil';

export interface Tab {
  key: TabKey;
  title: string;
  icon: string;
  emoji: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string[];
  artistId?: string[];
  releaseDate: string;
  coverUrl: string;
  spotifyUrl: string;
  youtubeUrl?: string;
  genre: string[];
  country: string[];
  isLiked?: boolean;
}

export interface Track {
  id: string;
  name: string;
  trackNumber: number;
  duration: number; // en millisecondes
  previewUrl: string | null;
  artists: string[];
  explicit: boolean;
}

export interface UserStats {
  totalAlbumsDiscovered: number;
  totalAlbumsLiked: number;
  favoriteGenres: string[];
  sessionStartDate: string;
  lastUsedDate: string;
  totalSwipes: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  enableVibration: boolean;
  enableSounds: boolean;
  firstLaunch: boolean;
}