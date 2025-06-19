// src/screens/AlbumDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Colors } from '../constants/colors';
import { Album, Track } from '../types';
import { SpotifyService } from '../services/spotify.service';
import { formatReleaseDate } from '../utils/date.utils';

const { width: screenWidth } = Dimensions.get('window');

interface AlbumDetailScreenProps {
  album: Album;
  isLiked: boolean;
  onToggleLike: (albumId: string) => void;
  onBack: () => void;
}

export default function AlbumDetailScreen({
  album,
  isLiked,
  onToggleLike,
  onBack,
}: AlbumDetailScreenProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const playbackStatusUpdateRef = useRef<((status: AVPlaybackStatus) => void) | undefined>(undefined);

  useEffect(() => {
    loadTracks();
    
    // Configuration audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      // Cleanup audio on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [album.id]);

  const loadTracks = async () => {
    try {
      const albumTracks = await SpotifyService.getAlbumTracks(album.id);
      setTracks(albumTracks);
    } catch (error) {
      console.error('Erreur chargement pistes:', error);
      Alert.alert('Erreur', 'Impossible de charger les pistes');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playTrack = async (track: Track) => {
    if (!track.previewUrl) {
      Alert.alert('Aperçu non disponible', 'Aucun aperçu disponible pour ce morceau');
      return;
    }

    try {
      // Stop current sound if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setPlayingTrackId(track.id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Erreur lecture:', error);
      Alert.alert('Erreur', 'Impossible de lire ce morceau');
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setPlayingTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingTrackId(null);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const openInSpotify = async () => {
    try {
      const supported = await Linking.canOpenURL(album.spotifyUrl);
      if (supported) {
        await Linking.openURL(album.spotifyUrl);
      } else {
        Alert.alert('Spotify', 'Impossible d\'ouvrir Spotify');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  };

  const openYouTube = async () => {
    if (!album.youtubeUrl) return;
    
    try {
      const supported = await Linking.canOpenURL(album.youtubeUrl);
      if (supported) {
        await Linking.openURL(album.youtubeUrl);
      } else {
        Alert.alert('YouTube', 'Impossible d\'ouvrir YouTube');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'album</Text>
        <TouchableOpacity 
          onPress={() => onToggleLike(album.id)} 
          style={styles.likeButton}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? Colors.heart : Colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image source={{ uri: album.coverUrl }} style={styles.albumCover} />
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumArtist}>{album.artist.join(', ')}</Text>
          <View style={styles.albumMeta}>
            <Text style={styles.albumDate}>{formatReleaseDate(album.releaseDate)}</Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={openInSpotify}>
              <Ionicons name="musical-notes" size={20} color="#1DB954" />
              <Text style={styles.actionButtonText}>Spotify</Text>
            </TouchableOpacity>
            {album.youtubeUrl && (
              <TouchableOpacity style={styles.actionButton} onPress={openYouTube}>
                <Ionicons name="play-circle" size={20} color="#FF0000" />
                <Text style={styles.actionButtonText}>YouTube</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Player Control (if track is playing) */}
        {playingTrackId && (
          <View style={styles.playerControl}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerTrackName} numberOfLines={1}>
                {tracks.find(t => t.id === playingTrackId)?.name}
              </Text>
              <Text style={styles.playerTime}>
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </Text>
            </View>
            <View style={styles.playerButtons}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={24} 
                  color={Colors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={stopPlayback} style={styles.stopButton}>
                <Ionicons name="stop" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tracks List */}
        <View style={styles.tracksSection}>
          <Text style={styles.sectionTitle}>
            Morceaux ({tracks.length})
          </Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
          ) : (
            tracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackItem,
                  playingTrackId === track.id && styles.trackItemActive
                ]}
                onPress={() => playTrack(track)}
                disabled={!track.previewUrl}
              >
                <View style={styles.trackNumber}>
                  {playingTrackId === track.id && isPlaying ? (
                    <Ionicons name="volume-high" size={16} color={Colors.primary} />
                  ) : (
                    <Text style={styles.trackNumberText}>{track.trackNumber}</Text>
                  )}
                </View>
                <View style={styles.trackInfo}>
                  <View style={styles.trackTitleRow}>
                    <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                    {track.explicit && (
                      <View style={styles.explicitBadge}>
                        <Text style={styles.explicitText}>E</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.trackArtists} numberOfLines={1}>
                    {track.artists.join(', ')}
                  </Text>
                </View>
                <View style={styles.trackRight}>
                  {track.previewUrl ? (
                    <Ionicons 
                      name="play-circle-outline" 
                      size={24} 
                      color={playingTrackId === track.id ? Colors.primary : Colors.textSecondary} 
                    />
                  ) : (
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={16} 
                      color={Colors.textTertiary} 
                    />
                  )}
                  <Text style={styles.trackDuration}>
                    {formatDuration(track.duration)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  likeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  albumInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
  },
  albumCover: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: 12,
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  albumArtist: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  albumMeta: {
    alignItems: 'center',
    marginBottom: 20,
  },
  albumDate: {
    fontSize: 14,
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  playerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
  },
  playerInfo: {
    flex: 1,
    marginRight: 16,
  },
  playerTrackName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  playerTime: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
  playerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    padding: 8,
  },
  tracksSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  trackItemActive: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  trackNumber: {
    width: 30,
    alignItems: 'center',
  },
  trackNumberText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trackInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  trackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  explicitBadge: {
    backgroundColor: Colors.textSecondary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 8,
  },
  explicitText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.background,
  },
  trackArtists: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trackRight: {
    alignItems: 'flex-end',
  },
  trackDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});