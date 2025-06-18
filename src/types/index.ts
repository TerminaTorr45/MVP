export type TabKey = 'nouvelles' | 'tendances' | 'genres' | 'concerts' | 'profil' | 'swipe';

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
  releaseDate: string;
  coverUrl: string;
  spotifyUrl: string;
  genre: string[];
  country: string[];
  isLiked?: boolean;
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