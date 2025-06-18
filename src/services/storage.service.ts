// src/services/storage.service.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/api';
import { UserStats } from '../types';

export class StorageService {
  // Albums aimés
  static async saveLikedAlbums(liked: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LIKED_ALBUMS, JSON.stringify(liked));
      console.log('✅ Albums aimés sauvegardés:', liked.length);
    } catch (error) {
      console.error('❌ Erreur sauvegarde favoris:', error);
    }
  }

  static async loadLikedAlbums(): Promise<string[]> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_ALBUMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Albums aimés chargés:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Erreur chargement favoris:', error);
    }
    return [];
  }

  // Statistiques utilisateur
  static async saveUserStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
      console.log('✅ Stats utilisateur sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde stats:', error);
    }
  }

  static async loadUserStats(): Promise<UserStats | null> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Stats utilisateur chargées');
        return parsed;
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
    return null;
  }

  // Albums découverts
  static async saveDiscoveredAlbums(discovered: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISCOVERED_ALBUMS, JSON.stringify(discovered));
      console.log('✅ Albums découverts sauvegardés:', discovered.length);
    } catch (error) {
      console.error('❌ Erreur sauvegarde découvertes:', error);
    }
  }

  static async loadDiscoveredAlbums(): Promise<string[]> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.DISCOVERED_ALBUMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Albums découverts chargés:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Erreur chargement découvertes:', error);
    }
    return [];
  }

  // Effacer toutes les données
  static async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LIKED_ALBUMS,
      STORAGE_KEYS.USER_STATS,
      STORAGE_KEYS.DISCOVERED_ALBUMS
    ]);
  }
}