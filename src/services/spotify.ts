/**
 * Holy Culture Radio - Spotify Service
 * Handles Spotify authentication and playback using PKCE flow
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
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

// SHA256 implementation for React Native
async function sha256(message: string): Promise<ArrayBuffer> {
  // Convert string to Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // Use SubtleCrypto if available (some React Native environments)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return await crypto.subtle.digest('SHA-256', msgBuffer);
  }

  // Fallback: Simple SHA256 implementation
  const hashArray = await sha256Fallback(message);
  return new Uint8Array(hashArray).buffer;
}

// Pure JS SHA256 fallback
async function sha256Fallback(message: string): Promise<number[]> {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  const bytes: number[] = [];
  for (let i = 0; i < message.length; i++) {
    bytes.push(message.charCodeAt(i));
  }

  bytes.push(0x80);
  while ((bytes.length + 8) % 64 !== 0) {
    bytes.push(0);
  }

  const bitLength = message.length * 8;
  for (let i = 7; i >= 0; i--) {
    bytes.push((bitLength >>> (i * 8)) & 0xff);
  }

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const W: number[] = [];
    for (let i = 0; i < 16; i++) {
      W[i] = (bytes[chunk + i * 4] << 24) | (bytes[chunk + i * 4 + 1] << 16) |
             (bytes[chunk + i * 4 + 2] << 8) | bytes[chunk + i * 4 + 3];
    }

    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H = [
      (H[0] + a) >>> 0, (H[1] + b) >>> 0, (H[2] + c) >>> 0, (H[3] + d) >>> 0,
      (H[4] + e) >>> 0, (H[5] + f) >>> 0, (H[6] + g) >>> 0, (H[7] + h) >>> 0,
    ];
  }

  const result: number[] = [];
  for (const h of H) {
    result.push((h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff);
  }
  return result;
}

function rightRotate(value: number, amount: number): number {
  return ((value >>> amount) | (value << (32 - amount))) >>> 0;
}

// Base64 URL encode for PKCE
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Custom base64 encoding (btoa not available in RN)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < binary.length) {
    const a = binary.charCodeAt(i++);
    const b = i < binary.length ? binary.charCodeAt(i++) : 0;
    const c = i < binary.length ? binary.charCodeAt(i++) : 0;

    const triplet = (a << 16) | (b << 8) | c;

    result += chars[(triplet >> 18) & 0x3f];
    result += chars[(triplet >> 12) & 0x3f];
    result += i - 2 < binary.length ? chars[(triplet >> 6) & 0x3f] : '';
    result += i - 1 < binary.length ? chars[triplet & 0x3f] : '';
  }

  // Convert to URL-safe base64
  return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64URLEncode(hashed);
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private isConnected: boolean = false;
  private authCallback: ((success: boolean) => void) | null = null;
  private codeVerifier: string | null = null;

  constructor() {
    this.loadStoredAuth();
    this.setupDeepLinkListener();
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
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        if (auth.expiresAt > Date.now()) {
          this.accessToken = auth.accessToken;
          this.refreshToken = auth.refreshToken;
          this.expiresAt = auth.expiresAt;
          this.isConnected = true;
        } else if (auth.refreshToken) {
          // Token expired but we have refresh token
          this.refreshToken = auth.refreshToken;
          await this.refreshAccessToken();
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
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
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

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
    if (!this.accessToken) {
      await this.loadStoredAuth();
    }

    if (!this.accessToken) return null;

    // Check if token expired and refresh
    if (Date.now() >= this.expiresAt - 60000) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
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
