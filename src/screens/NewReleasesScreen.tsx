// src/screens/NewReleasesScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Album } from '../types';
import { Colors } from '../constants/colors';
import AlbumCard from '../components/AlbumCard';

interface NewReleasesScreenProps {
  albums: Album[];
  likedAlbums: string[];
  onToggleLike: (albumId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onAlbumPress?: (album: Album) => void;
}

export default function NewReleasesScreen({
  albums,
  likedAlbums,
  onToggleLike,
  onRefresh,
  refreshing,
  onAlbumPress, // AJOUT - récupération du prop
}: NewReleasesScreenProps) {
  return (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>🎵 Nouvelles Sorties</Text>
        <Text style={styles.contentSubtitle}>
          {albums.length > 0 ? `${albums.length} albums cette semaine` : 'Chargement...'}
        </Text>
      </View>
      <View style={styles.albumsContainer}>
        {albums.map(album => (
          <AlbumCard
            key={album.id}
            album={album}
            isLiked={likedAlbums.includes(album.id)}
            onToggleLike={onToggleLike} // AJOUT - passage du prop
            onPress={() => onAlbumPress?.(album)} // AJOUT - gestion du clic
          />
        ))}
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
  albumsContainer: {
    paddingHorizontal: 16,
  },
});