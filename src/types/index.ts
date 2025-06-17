export interface Album {
  id: string;
  title: string;
  artist: string | string[];
  releaseDate: string;
  coverUrl: string;
  spotifyUrl: string;
  youtubeUrl?: string;
  genre: string[];
  country: string[];
  artistLocation?: {
    city: string;
    postalCode?: string;
  };
  popularity?: number;
}

export interface Artist {
  id: string;
  name: string;
  location?: {
    city: string;
    postalCode?: string;
  };
}

export interface Concert {
  id: string;
  artistName: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl: string;
}
