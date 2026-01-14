/**
 * Holy Culture Radio - TypeScript Types
 */

// Navigation Types
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  RadioPlayer: undefined;
  PodcastPlayer: { podcastId: string };
  DevotionalDetail: { devotionalId: string };
  ForumPost: { postId: string };
  CreatePost: undefined;
  Profile: { userId: string };
  Settings: undefined;
  SpotifyAuth: undefined;
  SpotifyPlayer: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Radio: undefined;
  Devotionals: undefined;
  Podcasts: undefined;
  Music: undefined;
  Forum: undefined;
};

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  isVerified: boolean;
  role: 'member' | 'moderator' | 'admin';
}

// Radio Types
export interface RadioStation {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  streamUrl: string;
  isLive: boolean;
  currentShow?: Show;
  schedule: ShowSchedule[];
}

export interface Show {
  id: string;
  title: string;
  host: string;
  description: string;
  imageUrl: string;
  startTime: Date;
  endTime: Date;
}

export interface ShowSchedule {
  dayOfWeek: number;
  shows: Show[];
}

// Devotional Types
export interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  scriptureReference: string;
  author: User;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
  tags: string[];
}

export interface DevotionalComment {
  id: string;
  devotionalId: string;
  author: User;
  content: string;
  createdAt: Date;
  likes: number;
}

// Podcast Types
export interface Podcast {
  id: string;
  title: string;
  description: string;
  host: string;
  imageUrl: string;
  episodes: PodcastEpisode[];
  category: string;
  isSubscribed?: boolean;
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: Date;
  imageUrl?: string;
  isPlayed?: boolean;
  playProgress?: number;
}

// Music/Spotify Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  trackCount: number;
  owner: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  trackCount: number;
  uri: string;
}

// Forum Types
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: User;
  category: ForumCategory;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  isLiked?: boolean;
  tags: string[];
  images?: string[];
}

export interface ForumReply {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  isLiked?: boolean;
  parentReplyId?: string;
}

// Player State Types
export interface PlayerState {
  isPlaying: boolean;
  currentTrack?: SpotifyTrack | PodcastEpisode;
  progress: number;
  duration: number;
  volume: number;
  repeatMode: 'off' | 'track' | 'context';
  shuffleEnabled: boolean;
  source: 'radio' | 'podcast' | 'spotify' | null;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
