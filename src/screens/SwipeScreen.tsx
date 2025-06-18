// src/screens/SwipeScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Album, UserStats } from '../types';
import { Colors } from '../constants/colors';
import { formatReleaseDate } from '../utils/date.utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeScreenProps {
  albums: Album[];
  likedAlbums: string[];
  discoveredAlbums: string[];
  onToggleLike: (albumId: string) => void;
  userStats: UserStats;
  onUpdateStats: (updates: Partial<UserStats>) => void;
  onReload: () => void;
  loading: boolean;
}

export default function SwipeScreen({
  albums,
  likedAlbums,
  discoveredAlbums,
  onToggleLike,
  userStats,
  onUpdateStats,
  onReload,
  loading
}: SwipeScreenProps) {
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const [swipeStack, setSwipeStack] = useState<Album[]>([]);

  // Animations
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.8)).current;

  // Variables pour suivre les gestes
  const currentTranslationX = useRef(0);
  const currentTranslationY = useRef(0);

  // Préparer la pile de swipe
  useEffect(() => {
    if (albums.length > 0 && swipeStack.length === 0) {
      setSwipeStack([...albums]);
    }
  }, [albums]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        currentTranslationX.current = event.nativeEvent.translationX;
        currentTranslationY.current = event.nativeEvent.translationY;
        
        const rotation = currentTranslationX.current / screenWidth * 20;
        rotateZ.setValue(rotation);
        
        const progress = Math.abs(currentTranslationX.current) / screenWidth;
        nextCardScale.setValue(0.9 + progress * 0.1);
        nextCardOpacity.setValue(0.8 + progress * 0.2);
        
        if (currentTranslationX.current > 100) {
          scale.setValue(0.95);
        } else if (currentTranslationX.current < -100) {
          scale.setValue(0.95);
        } else if (currentTranslationY.current < -100) {
          scale.setValue(1.05);
        } else {
          scale.setValue(1);
        }
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
      
      const SWIPE_THRESHOLD = screenWidth * 0.25;
      const LIKE_THRESHOLD = -80;
      const VELOCITY_THRESHOLD = 800;
      
      if (Math.abs(velocityX) > VELOCITY_THRESHOLD || Math.abs(velocityY) > VELOCITY_THRESHOLD) {
        if (velocityY < -VELOCITY_THRESHOLD) {
          handleLike();
          return;
        } else if (velocityX > VELOCITY_THRESHOLD) {
          handleSwipeRight();
          return;
        } else if (velocityX < -VELOCITY_THRESHOLD) {
          handleSwipeLeft();
          return;
        }
      }
      
      if (Math.abs(translationY) > Math.abs(translationX)) {
        if (translationY < LIKE_THRESHOLD) {
          handleLike();
        } else {
          resetCardPosition();
        }
      } else {
        if (translationX > SWIPE_THRESHOLD) {
          handleSwipeRight();
        } else if (translationX < -SWIPE_THRESHOLD) {
          handleSwipeLeft();
        } else {
          resetCardPosition();
        }
      }
    }
  };

  const handleLike = () => {
    const currentAlbum = swipeStack[currentAlbumIndex];
    if (currentAlbum) {
      onToggleLike(currentAlbum.id);
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateZ, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        nextCard();
      });
    }
  };

  const handleSwipeRight = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: screenWidth * 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateZ, {
        toValue: 30,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      nextCard();
    });
  };

  const handleSwipeLeft = () => {
    if (currentAlbumIndex > 0) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -screenWidth * 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateZ, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        previousCard();
      });
    } else {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -50,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(rotateZ, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
    
    Animated.parallel([
      Animated.spring(nextCardScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(nextCardOpacity, {
        toValue: 0.8,
        useNativeDriver: true,
      })
    ]).start();
  };

  const nextCard = () => {
    onUpdateStats({ 
      totalSwipes: userStats.totalSwipes + 1 
    });
    
    if (currentAlbumIndex < swipeStack.length - 1) {
      setCurrentAlbumIndex(prev => prev + 1);
    } else {
      setCurrentAlbumIndex(0);
    }
    resetAnimations();
  };

  const previousCard = () => {
    onUpdateStats({ 
      totalSwipes: userStats.totalSwipes + 1 
    });
    
    if (currentAlbumIndex > 0) {
      setCurrentAlbumIndex(prev => prev - 1);
    }
    resetAnimations();
  };

  const resetAnimations = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    rotateZ.setValue(0);
    scale.setValue(1);
    nextCardScale.setValue(0.9);
    nextCardOpacity.setValue(0.8);
    currentTranslationX.current = 0;
    currentTranslationY.current = 0;
  };

  const openCurrentAlbumInSpotify = async () => {
    const currentAlbum = swipeStack[currentAlbumIndex];
    if (!currentAlbum) return;
    
    try {
      const supported = await Linking.canOpenURL(currentAlbum.spotifyUrl);
      if (supported) {
        await Linking.openURL(currentAlbum.spotifyUrl);
      } else {
        Alert.alert('Spotify', 'Impossible d\'ouvrir Spotify. L\'application est-elle installée ?');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Spotify');
    }
  };

  if (loading || swipeStack.length === 0) {
    return (
      <View style={styles.swipeContainer}>
        <View style={styles.swipeHeader}>
          <Text style={styles.swipeTitle}>⚡ Mode Découverte</Text>
          <Text style={styles.swipeSubtitle}>Swipe pour explorer</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Préparation des albums...</Text>
          </View>
        ) : (
          <View style={styles.emptySwipe}>
            <Ionicons name="refresh" size={60} color={Colors.primary} />
            <Text style={styles.emptySwipeText}>Aucun album à découvrir</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
              <Text style={styles.reloadButtonText}>Recharger</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  const currentAlbum = swipeStack[currentAlbumIndex];
  const nextAlbum = swipeStack[currentAlbumIndex + 1];
  const isLiked = currentAlbum && likedAlbums.includes(currentAlbum.id);

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeHeader}>
        <Text style={styles.swipeTitle}>⚡ Découverte</Text>
        <Text style={styles.swipeSubtitle}>
          {currentAlbumIndex + 1} / {swipeStack.length}
        </Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTextOnly}>Swipe up to like • Swipe right for next</Text>
      </View>

      <View style={styles.cardStack}>
        {nextAlbum && (
          <Animated.View 
            style={[
              styles.swipeCard,
              styles.backgroundCard,
              {
                transform: [{ scale: nextCardScale }],
                opacity: nextCardOpacity,
              }
            ]}
          >
            <Image 
              source={{ 
                uri: nextAlbum.coverUrl,
                cache: 'force-cache'
              }} 
              style={styles.swipeAlbumImage}
              resizeMode="cover"
              blurRadius={0}
              fadeDuration={0}
            />
            <View style={styles.cardOverlay}>
              <Text style={styles.nextCardLabel}>SUIVANT</Text>
            </View>
          </Animated.View>
        )}

        {currentAlbum && (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            activeOffsetX={[-10, 10]}
            activeOffsetY={[-10, 10]}
            simultaneousHandlers={[]}
          >
            <Animated.View 
              style={[
                styles.swipeCard,
                styles.activeCard,
                {
                  transform: [
                    { translateX },
                    { translateY },
                    { rotateZ: rotateZ.interpolate({
                      inputRange: [-100, 0, 100],
                      outputRange: ['-15deg', '0deg', '15deg']
                    }) },
                    { scale }
                  ]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.swipeCardContent}
                onPress={openCurrentAlbumInSpotify}
                activeOpacity={0.9}
              >
                <View style={styles.swipeImageContainer}>
                  <Image 
                    source={{ 
                      uri: currentAlbum.coverUrl,
                      cache: 'force-cache'
                    }} 
                    style={styles.swipeAlbumImage}
                    resizeMode="cover"
                    blurRadius={0}
                    fadeDuration={0}
                    onError={(error) => {
                      console.log('Erreur chargement image:', error.nativeEvent.error);
                    }}
                  />
                  
                  {isLiked && (
                    <View style={styles.likedBadge}>
                      <Ionicons name="heart" size={20} color={Colors.text} />
                    </View>
                  )}
                </View>

                <View style={styles.swipeAlbumInfo}>
                  <Text style={styles.swipeAlbumTitle} numberOfLines={2}>
                    {currentAlbum.title}
                  </Text>
                  <Text style={styles.swipeAlbumArtist} numberOfLines={1}>
                    {currentAlbum.artist.join(', ')}
                  </Text>
                  <Text style={styles.swipeAlbumDate}>
                    {formatReleaseDate(currentAlbum.releaseDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        )}
      </View>

      <View style={styles.swipeStats}>
        <Text style={styles.swipeStatsText}>
          ❤️ {likedAlbums.length} favoris • 🎵 {discoveredAlbums.length} découverts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  swipeHeader: {
    padding: 15,
    alignItems: 'center',
  },
  swipeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  swipeSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
  },
  instructionTextOnly: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  swipeCard: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.55,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  backgroundCard: {
    zIndex: 1,
  },
  activeCard: {
    zIndex: 2,
  },
  swipeCardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  swipeImageContainer: {
    flex: 1,
    position: 'relative',
  },
  swipeAlbumImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
  },
  likedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.heart,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    alignItems: 'center',
  },
  nextCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    opacity: 0.8,
  },
  swipeAlbumInfo: {
    padding: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
  },
  swipeAlbumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  swipeAlbumArtist: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  swipeAlbumDate: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.primary,
    textAlign: 'center',
  },
  swipeStats: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  swipeStatsText: {
    fontSize: 14,
    fontWeight: '500',
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
  emptySwipe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySwipeText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});