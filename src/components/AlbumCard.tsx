// src/components/AlbumCard.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album } from '../types';
import { Colors } from '../constants/colors';
import { formatReleaseDate } from '../utils/date.utils';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32;

interface AlbumCardProps {
  album: Album;
  isLiked: boolean;
  onToggleLike?: (albumId: string) => void;
  onPress?: () => void;
}

export default function AlbumCard({ 
  album, 
  isLiked,
  onToggleLike,
  onPress 
}: AlbumCardProps) {
  return (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: album.coverUrl }} style={styles.albumImage} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {album.artist.join(', ')}
        </Text>
        <Text style={styles.albumDate}>{formatReleaseDate(album.releaseDate)}</Text>
      </View>
      {onToggleLike && (
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={(e) => {
            e.stopPropagation(); // Empêche le déclenchement du onPress parent
            onToggleLike(album.id);
          }}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? Colors.heart : Colors.text} 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  albumCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  albumDate: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.primary,
  },
  likeButton: {
    padding: 12,
  },
});