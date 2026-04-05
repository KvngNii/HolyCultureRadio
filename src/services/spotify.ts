/**
 * Holy Culture Radio - Spotify Service
 * Handles Spotify authentication and playback
 */

import { authorize, refresh, AuthConfiguration } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from '../types';

// Spotify API Configuration
// Replace with your credentials from Spotify Developer Dashboard
const SPOTIFY_CLIENT_ID = '32f987a2b6444f02b90ece924503d39f';
const SPOTIFY_REDIRECT_URI = 'holycultureradio://spotify-callback';

const SPOTIFY_AUTH_CONFIG: AuthConfiguration = {
  clientId: SPOTIFY_CLIENT_ID,
  redirectUrl: SPOTIFY_REDIRECT_URI,
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
  ],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

const STORAGE_KEY = '@spotify_auth';
const API_BASE = 'https://api.spotify.com/v1';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private isConnected: boolean = false;

  constructor() {
    this.loadStoredAuth();
  }

  private async loadStoredAuth() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        this.accessToken = auth.accessToken;
        this.refreshToken = auth.refreshToken;
        this.expiresAt = auth.expiresAt;
        this.isConnected = true;
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  }

  private async saveAuth() {
    try {
      const auth: StoredAuth = {
        accessToken: this.accessToken!,
        refreshToken: this.refreshToken!,
        expiresAt: this.expiresAt,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  }

  /**
   * Login with Spotify using OAuth
   */
  async login(): Promise<boolean> {
    try {
      const result = await authorize(SPOTIFY_AUTH_CONFIG);

      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.expiresAt = new Date(result.accessTokenExpirationDate).getTime();
      this.isConnected = true;

      await this.saveAuth();
      return true;
    } catch (error) {
      console.error('Spotify login error:', error);
      return false;
    }
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const result = await refresh(SPOTIFY_AUTH_CONFIG, {
        refreshToken: this.refreshToken,
      });

      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken || this.refreshToken;
      this.expiresAt = new Date(result.accessTokenExpirationDate).getTime();

      await this.saveAuth();
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.disconnect();
      return false;
    }
  }

  /**
   * Get valid access token, refreshing if needed
   */
  private async getValidToken(): Promise<string | null> {
    if (!this.accessToken) {
      await this.loadStoredAuth();
    }

    if (!this.accessToken) return null;

    // Refresh if token expires in less than 5 minutes
    if (Date.now() >= this.expiresAt - 300000) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    return this.accessToken;
  }

  /**
   * Make authenticated API requests to Spotify
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.apiRequest(endpoint, options);
        }
        return null;
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Spotify API error:', error);
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    await this.loadStoredAuth();
    return this.isConnected && !!this.accessToken;
  }

  /**
   * Get current user's profile
   */
  async getCurrentUser() {
    return this.apiRequest<any>('/me');
  }

  /**
   * Search for tracks, albums, or playlists
   */
  async search(query: string, types: string[] = ['track'], limit = 20) {
    const typeParam = types.join(',');
    return this.apiRequest<any>(`/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}`);
  }

  /**
   * Search for Christian/Gospel music
   */
  async searchChristianMusic(query = '', limit = 30) {
    const searchQuery = query
      ? `${query} genre:christian OR genre:gospel`
      : 'genre:christian OR genre:gospel';
    return this.apiRequest<any>(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}`);
  }

  /**
   * Search worship music
   */
  async searchWorshipMusic(limit = 30) {
    return this.apiRequest<any>(`/search?q=${encodeURIComponent('worship music')}&type=track,playlist&limit=${limit}`);
  }

  /**
   * Get a playlist by ID
   */
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
    return this.apiRequest(`/playlists/${playlistId}`);
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(playlistId: string, limit = 50, offset = 0) {
    return this.apiRequest<any>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get an album by ID
   */
  async getAlbum(albumId: string): Promise<SpotifyAlbum | null> {
    return this.apiRequest(`/albums/${albumId}`);
  }

  /**
   * Get album tracks
   */
  async getAlbumTracks(albumId: string, limit = 50) {
    return this.apiRequest<any>(`/albums/${albumId}/tracks?limit=${limit}`);
  }

  /**
   * Get user's saved tracks
   */
  async getSavedTracks(limit = 50, offset = 0) {
    return this.apiRequest<any>(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit = 50, offset = 0) {
    return this.apiRequest<any>(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get featured playlists
   */
  async getFeaturedPlaylists(limit = 20) {
    return this.apiRequest<any>(`/browse/featured-playlists?limit=${limit}&country=US`);
  }

  /**
   * Get category playlists (e.g., "christian", "gospel")
   */
  async getCategoryPlaylists(categoryId: string, limit = 20) {
    return this.apiRequest<any>(`/browse/categories/${categoryId}/playlists?limit=${limit}&country=US`);
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit = 20) {
    return this.apiRequest<any>(`/browse/new-releases?limit=${limit}&country=US`);
  }

  /**
   * Get recommendations
   */
  async getRecommendations(
    seedTracks: string[] = [],
    seedArtists: string[] = [],
    seedGenres: string[] = ['christian', 'gospel'],
    limit = 20
  ) {
    const params = new URLSearchParams();
    if (seedTracks.length) params.append('seed_tracks', seedTracks.slice(0, 2).join(','));
    if (seedArtists.length) params.append('seed_artists', seedArtists.slice(0, 2).join(','));
    if (seedGenres.length) params.append('seed_genres', seedGenres.slice(0, 1).join(','));
    params.append('limit', String(limit));

    return this.apiRequest<any>(`/recommendations?${params.toString()}`);
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayed(limit = 20) {
    return this.apiRequest<any>(`/me/player/recently-played?limit=${limit}`);
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(timeRange = 'medium_term', limit = 20) {
    return this.apiRequest<any>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  /**
   * Get available genre seeds
   */
  async getAvailableGenreSeeds() {
    return this.apiRequest<any>('/recommendations/available-genre-seeds');
  }

  // Playback Controls (requires Spotify Premium and active device)

  /**
   * Start playback
   */
  async play(uri?: string, contextUri?: string) {
    const body: any = {};
    if (contextUri) body.context_uri = contextUri;
    if (uri) body.uris = [uri];

    return this.apiRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Pause playback
   */
  async pause() {
    return this.apiRequest('/me/player/pause', { method: 'PUT' });
  }

  /**
   * Skip to next track
   */
  async next() {
    return this.apiRequest('/me/player/next', { method: 'POST' });
  }

  /**
   * Skip to previous track
   */
  async previous() {
    return this.apiRequest('/me/player/previous', { method: 'POST' });
  }

  /**
   * Seek to position in track
   */
  async seek(positionMs: number) {
    return this.apiRequest(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });
  }

  /**
   * Set volume
   */
  async setVolume(volumePercent: number) {
    return this.apiRequest(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });
  }

  /**
   * Get current playback state
   */
  async getPlaybackState() {
    return this.apiRequest<any>('/me/player');
  }

  /**
   * Get available devices
   */
  async getDevices() {
    return this.apiRequest<any>('/me/player/devices');
  }

  /**
   * Transfer playback to a device
   */
  async transferPlayback(deviceId: string, play = true) {
    return this.apiRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play,
      }),
    });
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get access token for external use
   */
  async getAccessToken(): Promise<string | null> {
    return this.getValidToken();
  }

  /**
   * Disconnect from Spotify
   */
  async disconnect() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.isConnected = false;
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
