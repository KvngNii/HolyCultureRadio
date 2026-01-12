/**
 * Holy Culture Radio - Spotify Service
 * Handles Spotify authentication and playback
 */

import { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from '../types';

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_REDIRECT_URI = 'holycultureradio://spotify-callback';
const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(' ');

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isConnected: boolean = false;

  /**
   * Generate the Spotify OAuth URL for authentication
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Handle the OAuth callback and exchange code for tokens
   */
  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      // In production, this should go through your backend
      // to keep the client secret secure
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          // client_secret should be handled server-side
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.isConnected = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Spotify auth error:', error);
      return false;
    }
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: SPOTIFY_CLIENT_ID,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Make authenticated API requests to Spotify
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.apiRequest(endpoint, options);
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Spotify API error:', error);
      return null;
    }
  }

  /**
   * Get current user's profile
   */
  async getCurrentUser() {
    return this.apiRequest('/me');
  }

  /**
   * Search for tracks, albums, or playlists
   */
  async search(query: string, types: ('track' | 'album' | 'playlist')[] = ['track']) {
    const typeParam = types.join(',');
    return this.apiRequest(`/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=20`);
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
  async getPlaylistTracks(playlistId: string, limit: number = 50, offset: number = 0) {
    return this.apiRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get an album by ID
   */
  async getAlbum(albumId: string): Promise<SpotifyAlbum | null> {
    return this.apiRequest(`/albums/${albumId}`);
  }

  /**
   * Get user's saved tracks
   */
  async getSavedTracks(limit: number = 50, offset: number = 0) {
    return this.apiRequest(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit: number = 50, offset: number = 0) {
    return this.apiRequest(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get featured playlists
   */
  async getFeaturedPlaylists() {
    return this.apiRequest('/browse/featured-playlists');
  }

  /**
   * Get recommendations based on seed tracks
   */
  async getRecommendations(seedTracks: string[], seedArtists: string[] = [], seedGenres: string[] = []) {
    const params = new URLSearchParams();
    if (seedTracks.length) params.append('seed_tracks', seedTracks.join(','));
    if (seedArtists.length) params.append('seed_artists', seedArtists.join(','));
    if (seedGenres.length) params.append('seed_genres', seedGenres.join(','));
    params.append('limit', '20');

    return this.apiRequest(`/recommendations?${params.toString()}`);
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
    return this.apiRequest('/me/player');
  }

  /**
   * Get available devices
   */
  async getDevices() {
    return this.apiRequest('/me/player/devices');
  }

  /**
   * Transfer playback to a device
   */
  async transferPlayback(deviceId: string, play: boolean = true) {
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
   * Disconnect from Spotify
   */
  disconnect() {
    this.accessToken = null;
    this.refreshToken = null;
    this.isConnected = false;
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
