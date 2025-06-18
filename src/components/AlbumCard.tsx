// src/components/AlbumCard.tsx

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album } from '../types';
import { Colors } from '../constants/colors';
import { formatReleaseDate } from '../utils/date.utils';

interface AlbumCardProps {
  album: Album;
  isLiked: boolean;
  onPress?: () => void;
}

export default function AlbumCard({ album, isLiked, onPress }: AlbumCardProps) {
  const openAlbumInSpotify = async () => {
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

  return (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={onPress || openAlbumInSpotify}
    >
      <View style={styles.albumCover}>
        {album.coverUrl ? (
          <Image 
            source={{ 
              uri: album.coverUrl,
              cache: 'force-cache'
            }} 
            style={styles.albumImage}
            resizeMode="cover"
            blurRadius={0}
            fadeDuration={0}
          />
        ) : (
          <Ionicons name="musical-note" size={30} color={Colors.primary} />
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {album.artist.join(', ')}
        </Text>
        <Text style={styles.albumRelease}>
          {formatReleaseDate(album.releaseDate)}
        </Text>
      </View>
      {isLiked && (
        <Ionicons name="heart" size={20} color={Colors.heart} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  albumCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  albumCover: {
    width: 60,
    height: 60,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  albumRelease: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.primary,
  },
});