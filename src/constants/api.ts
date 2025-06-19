// src/constants/api.ts

export const STORAGE_KEYS = {
  LIKED_ALBUMS: '@album_app:liked_albums',
  USER_STATS: '@album_app:user_stats',
  DISCOVERED_ALBUMS: '@album_app:discovered_albums',
  APP_SETTINGS: '@album_app:settings'
};

export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
export const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;  