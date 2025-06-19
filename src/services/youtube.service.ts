// src/services/youtube.service.ts

import { YOUTUBE_API_KEY } from '../constants/api';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export class YouTubeService {
  private static API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

  /**
   * Recherche une vidéo YouTube pour un album/artiste donné
   */
  static async searchAlbumVideo(albumTitle: string, artistName: string): Promise<string | null> {
    try {
      if (!YOUTUBE_API_KEY) {
        console.error('❌ Clé API YouTube manquante');
        return null;
      }

      // Construire la requête de recherche optimisée
      const searchQueries = [
        `${artistName} ${albumTitle} official video`,
        `${artistName} ${albumTitle} official audio`,
        `${artistName} ${albumTitle}`,
      ];

      for (const query of searchQueries) {
        const url = `${this.API_BASE_URL}/search?` + new URLSearchParams({
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: '5',
          key: YOUTUBE_API_KEY,
          videoCategoryId: '10', // Musique
          order: 'relevance'
        });

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('Erreur YouTube API:', response.status);
          continue;
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          // Filtrer pour trouver la meilleure correspondance
          const bestMatch = this.findBestMatch(data.items, albumTitle, artistName);
          
          if (bestMatch) {
            return `https://www.youtube.com/watch?v=${bestMatch.id.videoId}`;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur recherche YouTube:', error);
      return null;
    }
  }

  /**
   * Trouve la meilleure correspondance parmi les résultats YouTube
   */
  private static findBestMatch(items: any[], albumTitle: string, artistName: string): any {
    // Scorer chaque résultat
    const scoredItems = items.map(item => {
      const title = item.snippet.title.toLowerCase();
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      const description = (item.snippet.description || '').toLowerCase();
      
      let score = 0;

      // Bonus si le titre contient le nom de l'album
      if (title.includes(albumTitle.toLowerCase())) score += 10;
      
      // Bonus si le titre contient le nom de l'artiste
      if (title.includes(artistName.toLowerCase())) score += 10;
      
      // Bonus si c'est sur la chaîne officielle de l'artiste
      if (channelTitle.includes(artistName.toLowerCase())) score += 15;
      
      // Bonus pour les mots clés officiels
      if (title.includes('official')) score += 5;
      if (title.includes('audio')) score += 3;
      if (title.includes('video')) score += 3;
      
      // Pénalité pour les contenus non désirés
      if (title.includes('cover') || title.includes('remix')) score -= 5;
      if (title.includes('live') && !albumTitle.toLowerCase().includes('live')) score -= 3;
      if (title.includes('reaction') || title.includes('review')) score -= 10;
      if (title.includes('lyrics') || title.includes('lyric video')) score -= 2;

      return { item, score };
    });

    // Trier par score et retourner le meilleur
    scoredItems.sort((a, b) => b.score - a.score);
    
    // Ne retourner que si le score est suffisant
    return scoredItems[0]?.score > 5 ? scoredItems[0].item : null;
  }

  /**
   * Traite un batch d'albums pour récupérer leurs liens YouTube
   * (Optimisé pour éviter de dépasser les quotas API)
   */
  static async processAlbumsBatch(
    albums: Array<{ id: string; title: string; artist: string }>
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const BATCH_SIZE = 5; // Traiter 5 albums à la fois
    const DELAY_BETWEEN_BATCHES = 1000; // 1 seconde entre les batches

    console.log(`🔄 Recherche YouTube pour ${albums.length} albums...`);

    for (let i = 0; i < albums.length; i += BATCH_SIZE) {
      const batch = albums.slice(i, i + BATCH_SIZE);
      
      // Traiter le batch en parallèle
      const promises = batch.map(async (album) => {
        const youtubeUrl = await this.searchAlbumVideo(album.title, album.artist);
        if (youtubeUrl) {
          results.set(album.id, youtubeUrl);
        }
      });

      await Promise.all(promises);

      // Attendre avant le prochain batch (pour respecter les quotas)
      if (i + BATCH_SIZE < albums.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

      console.log(`✅ ${results.size}/${i + batch.length} liens YouTube trouvés`);
    }

    return results;
  }
}