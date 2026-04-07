/**
 * Holy Culture Radio - Spotify Service
 * Handles Spotify authentication and playback using PKCE flow
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { sha256 } from 'js-sha256';
import { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from '../types';

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '32f987a2b6444f02b90ece924503d39f';
const SPOTIFY_REDIRECT_URI = 'holycultureradio://spotify-callback';
const SPOTIFY_SCOPES = [
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
].join(' ');

const STORAGE_KEY = '@spotify_auth';
const VERIFIER_KEY = '@spotify_verifier';
const API_BASE = 'https://api.spotify.com/v1';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Generate random string for PKCE
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return result;
}

// Base64 URL encode for PKCE
function base64URLEncode(bytes: number[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (a << 16) | (b << 8) | c;

    result += chars[(triplet >> 18) & 0x3f];
    result += chars[(triplet >> 12) & 0x3f];
    result += i + 1 < bytes.length ? chars[(triplet >> 6) & 0x3f] : '';
    result += i + 2 < bytes.length ? chars[triplet & 0x3f] : '';
  }

  // Convert to URL-safe base64 (no padding)
  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

// Generate code challenge from verifier using SHA256
function generateCodeChallenge(verifier: string): string {
  const hash = sha256.array(verifier);
  return base64URLEncode(hash);
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private isConnected: boolean = false;
  private authCallback: ((success: boolean) => void) | null = null;
  private codeVerifier: string | null = null;
  private authLoadPromise: Promise<void> | null = null;

  constructor() {
    // Store the promise so we can await it later
    this.authLoadPromise = this.loadStoredAuth();
    this.setupDeepLinkListener();
  }

  // Wait for initial auth to be loaded
  private async ensureAuthLoaded(): Promise<void> {
    if (this.authLoadPromise) {
      await this.authLoadPromise;
      this.authLoadPromise = null;
    }
  }

  private setupDeepLinkListener() {
    // Listen for OAuth callback
    Linking.addEventListener('url', (event) => {
      this.handleRedirect(event.url);
    });

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleRedirect(url);
      }
    });
  }

  private async handleRedirect(url: string) {
    if (!url.startsWith(SPOTIFY_REDIRECT_URI)) return;

    // Parse authorization code from URL
    // URL format: holycultureradio://spotify-callback?code=...
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const error = urlObj.searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      this.authCallback?.(false);
      return;
    }

    if (code) {
      // Exchange code for tokens
      const success = await this.exchangeCodeForTokens(code);
      this.authCallback?.(success);
    } else {
      this.authCallback?.(false);
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
      // Get stored code verifier
      const verifier = await AsyncStorage.getItem(VERIFIER_KEY);
      if (!verifier) {
        console.error('No code verifier found');
        return false;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          code_verifier: verifier,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresAt = Date.now() + (data.expires_in * 1000);
        this.isConnected = true;
        await this.saveAuth();
        await AsyncStorage.removeItem(VERIFIER_KEY);
        return true;
      } else {
        console.error('Token exchange failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      return false;
    }
  }

  private async loadStoredAuth() {
    try {
      console.log('[Spotify] Loading stored auth...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        console.log('[Spotify] Found stored auth, expires at:', new Date(auth.expiresAt).toISOString());
        console.log('[Spotify] Current time:', new Date().toISOString());
        console.log('[Spotify] Token valid:', auth.expiresAt > Date.now());

        if (auth.expiresAt > Date.now()) {
          this.accessToken = auth.accessToken;
          this.refreshToken = auth.refreshToken;
          this.expiresAt = auth.expiresAt;
          this.isConnected = true;
          console.log('[Spotify] Token loaded successfully');
        } else if (auth.refreshToken) {
          // Token expired but we have refresh token
          console.log('[Spotify] Token expired, attempting refresh...');
          this.refreshToken = auth.refreshToken;
          const refreshed = await this.refreshAccessToken();
          console.log('[Spotify] Refresh result:', refreshed);
        } else {
          console.log('[Spotify] No refresh token, clearing auth');
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } else {
        console.log('[Spotify] No stored auth found');
      }
    } catch (error) {
      console.error('[Spotify] Error loading stored auth:', error);
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

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
        }
        this.expiresAt = Date.now() + (data.expires_in * 1000);
        this.isConnected = true;
        await this.saveAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Login with Spotify - opens browser for OAuth with PKCE
   */
  async login(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.authCallback = resolve;

      // Generate PKCE code verifier and challenge (S256 method)
      const codeVerifier = generateRandomString(128);
      const codeChallenge = generateCodeChallenge(codeVerifier);

      // Store verifier for token exchange
      await AsyncStorage.setItem(VERIFIER_KEY, codeVerifier);

      const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        show_dialog: 'true',
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

      Linking.openURL(authUrl).catch((error) => {
        console.error('Error opening Spotify auth URL:', error);
        resolve(false);
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        if (this.authCallback === resolve) {
          this.authCallback = null;
          resolve(false);
        }
      }, 120000);
    });
  }

  /**
   * Make authenticated API requests to Spotify
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    console.log('[Spotify API] Request to:', endpoint);

    // Ensure initial auth load is complete
    await this.ensureAuthLoaded();

    if (!this.accessToken) {
      console.log('[Spotify API] No token, loading stored auth...');
      await this.loadStoredAuth();
    }

    if (!this.accessToken) {
      console.log('[Spotify API] Still no token after loading - not authenticated');
      return null;
    }

    // Check if token expired and refresh
    if (Date.now() >= this.expiresAt - 60000) {
      console.log('[Spotify API] Token expired or expiring soon, refreshing...');
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        console.log('[Spotify API] Token refresh failed');
        return null;
      }
    }

    try {
      const url = `${API_BASE}${endpoint}`;
      console.log('[Spotify API] Fetching:', url);

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('[Spotify API] Response status:', response.status);

      if (response.status === 401) {
        console.log('[Spotify API] 401 Unauthorized, refreshing token...');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.apiRequest(endpoint, options);
        }
        return null;
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log('[Spotify API] Response data keys:', data ? Object.keys(data) : 'null');

      if (data?.error) {
        console.error('[Spotify API] Error in response:', data.error);
      }

      return data;
    } catch (error) {
      console.error('[Spotify API] Fetch error:', error);
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    await this.ensureAuthLoaded();
    const authenticated = this.isConnected && !!this.accessToken;
    console.log('[Spotify] isAuthenticated:', authenticated, 'hasToken:', !!this.accessToken, 'isConnected:', this.isConnected);
    return authenticated;
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
    return this.apiRequest<any>(`/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}&market=US`);
  }

  /**
   * Search for Christian/Gospel music
   */
  /**
   * Search for Christian/Gospel music
   */
  async searchChristianMusic(query = '', limit = 30) {
    const searchQuery = query || 'christian gospel worship';
    console.log('[Spotify] searchChristianMusic called with query:', searchQuery);
    // Add market=US to ensure we get results (tracks are market-restricted)
    const result = await this.apiRequest<any>(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}&market=US`);
    console.log('[Spotify] searchChristianMusic result:', result?.tracks?.items?.length || 0, 'tracks found');
    return result;
  }

  /**
   * Search worship music
   */
  async searchWorshipMusic(limit = 30) {
    return this.apiRequest<any>(`/search?q=${encodeURIComponent('worship music')}&type=track,playlist&limit=${limit}&market=US`);
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
    await this.loadStoredAuth();
    if (Date.now() >= this.expiresAt) return null;
    return this.accessToken;
  }

  /**
   * Disconnect from Spotify
   */
  async disconnect() {
    this.accessToken = null;
    this.expiresAt = 0;
    this.isConnected = false;
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
