// App.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Services
import { SpotifyService } from './src/services/spotify.service';
import { StorageService } from './src/services/storage.service';

// Navigation
import TabNavigator from './src/navigation/TabNavigator';

// Screens
import SwipeScreen from './src/screens/SwipeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NewReleasesScreen from './src/screens/NewReleasesScreen';

// Types & Constants
import { Album, UserStats, TabKey } from './src/types';
import { Colors } from './src/constants/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('swipe');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [likedAlbums, setLikedAlbums] = useState<string[]>([]);
  const [discoveredAlbums, setDiscoveredAlbums] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalAlbumsDiscovered: 0,
    totalAlbumsLiked: 0,
    favoriteGenres: [],
    sessionStartDate: new Date().toISOString(),
    lastUsedDate: new Date().toISOString(),
    totalSwipes: 0
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  // Charger toutes les données au démarrage
  useEffect(() => {
    loadAllData();
  }, []);

  // Charger les albums Spotify après que les données persistantes soient chargées
  useEffect(() => {
    if (dataLoaded) {
      loadNewReleases();
    }
  }, [dataLoaded]);

  // Sauvegarder automatiquement les albums aimés quand ils changent
  useEffect(() => {
    if (dataLoaded && likedAlbums.length >= 0) {
      StorageService.saveLikedAlbums(likedAlbums);
      updateUserStats({ totalAlbumsLiked: likedAlbums.length });
    }
  }, [likedAlbums, dataLoaded]);

  // Sauvegarder les albums découverts
  useEffect(() => {
    if (dataLoaded && discoveredAlbums.length >= 0) {
      StorageService.saveDiscoveredAlbums(discoveredAlbums);
      updateUserStats({ totalAlbumsDiscovered: discoveredAlbums.length });
    }
  }, [discoveredAlbums, dataLoaded]);

  const loadAllData = async () => {
    console.log('🔄 Chargement des données persistantes...');
    try {
      await Promise.all([
        StorageService.loadLikedAlbums().then(setLikedAlbums),
        StorageService.loadUserStats().then(stats => {
          if (stats) setUserStats(stats);
        }),
        StorageService.loadDiscoveredAlbums().then(setDiscoveredAlbums)
      ]);
      setDataLoaded(true);
      console.log('✅ Toutes les données chargées');
    } catch (error) {
      console.error('❌ Erreur chargement général:', error);
      setDataLoaded(true);
    }
  };

  const loadNewReleases = async () => {
    setLoading(true);
    try {
      const newAlbums = await SpotifyService.getNewReleases();
      setAlbums(newAlbums);
    } catch (error) {
      console.error('❌ Erreur chargement albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNewReleases();
    setRefreshing(false);
  };

  const toggleLike = (albumId: string) => {
    setLikedAlbums(prev => {
      const newLiked = prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId];
      
      console.log(`${prev.includes(albumId) ? '💔' : '❤️'} Album ${albumId.slice(0, 8)}...`);
      return newLiked;
    });

    // Marquer comme découvert si pas déjà fait
    if (!discoveredAlbums.includes(albumId)) {
      setDiscoveredAlbums(prev => [...prev, albumId]);
    }
  };

  const updateUserStats = (updates: Partial<UserStats>) => {
    const newStats = {
      ...userStats,
      ...updates,
      lastUsedDate: new Date().toISOString()
    };
    setUserStats(newStats);
    StorageService.saveUserStats(newStats);
  };

  const handleClearData = async () => {
    await StorageService.clearAllData();
    setLikedAlbums([]);
    setDiscoveredAlbums([]);
    setUserStats({
      totalAlbumsDiscovered: 0,
      totalAlbumsLiked: 0,
      favoriteGenres: [],
      sessionStartDate: new Date().toISOString(),
      lastUsedDate: new Date().toISOString(),
      totalSwipes: 0
    });
  };

  const renderContent = () => {
    if (!dataLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement de vos données...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'swipe':
        return (
          <SwipeScreen
            albums={albums}
            likedAlbums={likedAlbums}
            discoveredAlbums={discoveredAlbums}
            onToggleLike={toggleLike}
            userStats={userStats}
            onUpdateStats={updateUserStats}
            onReload={loadNewReleases}
            loading={loading}
          />
        );

      case 'nouvelles':
        return (
          <NewReleasesScreen
            albums={albums}
            likedAlbums={likedAlbums}
            onToggleLike={toggleLike}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );

      case 'profil':
        return (
          <ProfileScreen
            userStats={userStats}
            likedAlbums={likedAlbums}
            discoveredAlbums={discoveredAlbums}
            albums={albums}
            onClearData={handleClearData}
          />
        );

      default:
        return (
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>🚧 En construction</Text>
              <Text style={styles.contentSubtitle}>Fonctionnalité bientôt disponible</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ALBUM</Text>
        <Text style={styles.headerSubtitle}>
          LIKE • {likedAlbums.length} ❤️ • {userStats.totalSwipes} swipes
        </Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <TabNavigator 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentHeader: {
    padding: 20,
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginTop: 16,
  },
});