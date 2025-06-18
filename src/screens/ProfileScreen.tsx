// src/screens/ProfileScreen.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album, UserStats } from '../types';
import { Colors } from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface ProfileScreenProps {
  userStats: UserStats;
  likedAlbums: string[];
  discoveredAlbums: string[];
  albums: Album[];
  onClearData: () => void;
}

export default function ProfileScreen({
  userStats,
  likedAlbums,
  discoveredAlbums,
  albums,
  onClearData,
}: ProfileScreenProps) {
  const openAlbumInSpotify = async (album: Album) => {
    try {
      const supported = await Linking.canOpenURL(album.spotifyUrl);
      if (supported) {
        await Linking.openURL(album.spotifyUrl);
      } else {
        Alert.alert('Spotify', 'Impossible d\'ouvrir Spotify. L\'application est-elle installée ?');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Spotify');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Effacer les données',
      'Supprimer tous vos favoris et statistiques ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await onClearData();
            Alert.alert('✅', 'Données effacées !');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>👤 Mon Espace</Text>
        <Text style={styles.contentSubtitle}>Statistiques et préférences</Text>
      </View>
      
      {/* Section Statistiques */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Mes Statistiques</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color={Colors.heart} />
            <Text style={styles.statNumber}>{likedAlbums.length}</Text>
            <Text style={styles.statLabel}>Albums aimés</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color={Colors.flash} />
            <Text style={styles.statNumber}>{discoveredAlbums.length}</Text>
            <Text style={styles.statLabel}>Découverts</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="hand-left" size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>{userStats.totalSwipes}</Text>
            <Text style={styles.statLabel}>Total swipes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={Colors.purple} />
            <Text style={styles.statNumber}>
              {Math.floor((new Date().getTime() - new Date(userStats.sessionStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
            </Text>
            <Text style={styles.statLabel}>Jours d'usage</Text>
          </View>
        </View>
      </View>

      {/* Section Favoris récents */}
      <View style={styles.favoritesSection}>
        <Text style={styles.sectionTitle}>❤️ Favoris Récents</Text>
        {likedAlbums.length > 0 ? (
          <View style={styles.recentFavorites}>
            {albums
              .filter(album => likedAlbums.includes(album.id))
              .slice(0, 3)
              .map(album => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.miniAlbumCard}
                  onPress={() => openAlbumInSpotify(album)}
                >
                  <Image
                    source={{ uri: album.coverUrl }}
                    style={styles.miniAlbumImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.miniAlbumTitle} numberOfLines={1}>
                    {album.title}
                  </Text>
                  <Text style={styles.miniAlbumArtist} numberOfLines={1}>
                    {album.artist[0]}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        ) : (
          <View style={styles.emptyFavorites}>
            <Ionicons name="heart-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyFavoritesText}>Aucun favori pour le moment</Text>
            <Text style={styles.emptyFavoritesSubtext}>Swipe vers le haut pour aimer des albums !</Text>
          </View>
        )}
      </View>

      <View style={styles.profileOptions}>
        <View style={styles.profileOption}>
          <Ionicons name="musical-notes" size={24} color={Colors.primary} />
          <View style={styles.profileOptionContent}>
            <Text style={styles.profileOptionText}>Spotify connecté</Text>
            <Text style={styles.profileOptionSubtext}>API fonctionnelle • Données en temps réel</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.profileOption} onPress={handleClearData}>
          <Ionicons name="trash" size={24} color={Colors.heart} />
          <View style={styles.profileOptionContent}>
            <Text style={styles.profileOptionText}>Effacer mes données</Text>
            <Text style={styles.profileOptionSubtext}>Supprimer favoris et statistiques</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: screenWidth * 0.42,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  favoritesSection: {
    padding: 16,
    paddingTop: 0,
  },
  recentFavorites: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniAlbumCard: {
    width: screenWidth * 0.28,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
  },
  miniAlbumImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
  miniAlbumTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  miniAlbumArtist: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyFavoritesSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  profileOptions: {
    padding: 16,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileOptionContent: {
    marginLeft: 16,
    flex: 1,
  },
  profileOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  profileOptionSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});