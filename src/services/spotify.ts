/**
 * Holy Culture Radio - Spotify Service
 * Handles Spotify authentication and playback using PKCE flow
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import { Linking } from 'react-native';
import { sha256 } from 'js-sha256';
import { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from '../types';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '../config';

const SPOTIFY_SCOPES = [
  'streaming',
  'app-remote-control',
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

// Dev-only logger — no auth data leaks in production builds
const devLog = (...args: unknown[]) => { if (__DEV__) console.log(...args); };

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Generate a cryptographically secure random string for the PKCE verifier.
// `globalThis.crypto` is available in React Native >= 0.71 (Hermes >= 0.12).
// Bare `crypto` is NOT a global in older Hermes builds — always use globalThis.
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);

  // Prefer Web Crypto; fall back gracefully for older Hermes builds.
  const webCrypto: Crypto | null =
    (typeof globalThis !== 'undefined' && (globalThis as any).crypto) ||
    (typeof global !== 'undefined' && (global as any).crypto) ||
    null;

  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(array);
  } else {
    // Fallback: not CSPRNG but acceptable for PKCE in this context
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Base64 URL encode for PKCE challenge
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

  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

// Generate SHA-256 code challenge from verifier
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
  private authLoadPromise: Promise<void> | null = null;

  constructor() {
    this.authLoadPromise = this.loadStoredAuth();
    this.setupDeepLinkListener();
  }

  private async ensureAuthLoaded(): Promise<void> {
    if (this.authLoadPromise) {
      await this.authLoadPromise;
      this.authLoadPromise = null;
    }
  }

  private setupDeepLinkListener() {
    Linking.addEventListener('url', (event) => {
      this.handleRedirect(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) this.handleRedirect(url);
    });
  }

  private async handleRedirect(url: string) {
    if (!url.startsWith(SPOTIFY_REDIRECT_URI)) return;

    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const error = urlObj.searchParams.get('error');

    if (error) {
      console.error('[Spotify] Auth error from redirect:', error);
      this.authCallback?.(false);
      return;
    }

    if (code) {
      const success = await this.exchangeCodeForTokens(code);
      this.authCallback?.(success);
    } else {
      this.authCallback?.(false);
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
      const verifier = await EncryptedStorage.getItem(VERIFIER_KEY);
      if (!verifier) {
        console.error('[Spotify] No code verifier found');
        return false;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          code_verifier: verifier,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresAt = Date.now() + data.expires_in * 1000;
        this.isConnected = true;
        await this.saveAuth();
        await EncryptedStorage.removeItem(VERIFIER_KEY);
        return true;
      }

      console.error('[Spotify] Token exchange failed:', data.error ?? data);
      return false;
    } catch (error) {
      console.error('[Spotify] Token exchange error:', error);
      return false;
    }
  }

  private async loadStoredAuth() {
    try {
      devLog('[Spotify] Loading stored auth...');
      const stored = await EncryptedStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        devLog('[Spotify] Token valid:', auth.expiresAt > Date.now());

        if (auth.expiresAt > Date.now()) {
          this.accessToken = auth.accessToken;
          this.refreshToken = auth.refreshToken;
          this.expiresAt = auth.expiresAt;
          this.isConnected = true;
          devLog('[Spotify] Token loaded successfully');
        } else if (auth.refreshToken) {
          devLog('[Spotify] Token expired, refreshing...');
          this.refreshToken = auth.refreshToken;
          const refreshed = await this.refreshAccessToken();
          devLog('[Spotify] Refresh result:', refreshed);
        } else {
          devLog('[Spotify] No refresh token, clearing auth');
          await EncryptedStorage.removeItem(STORAGE_KEY);
        }
      } else {
        devLog('[Spotify] No stored auth found');
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
      await EncryptedStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error('[Spotify] Error saving auth:', error);
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        if (data.refresh_token) this.refreshToken = data.refresh_token;
        this.expiresAt = Date.now() + data.expires_in * 1000;
        this.isConnected = true;
        await this.saveAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Spotify] Token refresh error:', error);
      return false;
    }
  }

  async login(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.authCallback = resolve;

      const codeVerifier = generateRandomString(128);
      const codeChallenge = generateCodeChallenge(codeVerifier);

      await EncryptedStorage.setItem(VERIFIER_KEY, codeVerifier);

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
        console.error('[Spotify] Error opening auth URL:', error);
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

  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    devLog('[Spotify API] Request to:', endpoint);

    await this.ensureAuthLoaded();

    if (!this.accessToken) {
      devLog('[Spotify API] No token — not authenticated');
      return null;
    }

    // Refresh if expired or expiring within 60 s
    if (Date.now() >= this.expiresAt - 60000) {
      devLog('[Spotify API] Token expiring soon, refreshing...');
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        devLog('[Spotify API] Token refresh failed');
        return null;
      }
    }

    try {
      const url = `${API_BASE}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      devLog('[Spotify API] Response status:', response.status);

      if (response.status === 401) {
        devLog('[Spotify API] 401 — refreshing token and retrying...');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) return this.apiRequest(endpoint, options);
        return null;
      }

      if (response.status === 204) return null;

      const data = await response.json();

      if (!response.ok || data?.error) {
        console.error('[Spotify API] Error in response:', data?.error ?? { status: response.status });
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Spotify API] Fetch error:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    await this.ensureAuthLoaded();
    if (this.accessToken && Date.now() < this.expiresAt - 60000) {
      return this.accessToken;
    }
    const refreshed = await this.refreshAccessToken();
    return refreshed ? this.accessToken : null;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.ensureAuthLoaded();
    const authenticated = this.isConnected && !!this.accessToken;
    devLog('[Spotify] isAuthenticated:', authenticated);
    return authenticated;
  }

  async getCurrentUser() {
    return this.apiRequest<any>('/me');
  }

  async search(query: string, types: string[] = ['track'], limit = 20) {
    const typeParam = types.join(',');
    return this.apiRequest<any>(`/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}&market=US`);
  }

  async searchChristianMusic(query = '', limit = 20) {
    const searchQuery = query || 'christian gospel worship';
    devLog('[Spotify] searchChristianMusic query:', searchQuery);
    const params = new URLSearchParams({ q: searchQuery, type: 'track' });
    const result = await this.apiRequest<any>(`/search?${params.toString()}`);
    devLog('[Spotify] tracks found:', result?.tracks?.items?.length ?? 0);
    return result;
  }

  async searchWorshipMusic(limit = 30) {
    return this.apiRequest<any>(`/search?q=${encodeURIComponent('worship music')}&type=track,playlist&limit=${limit}&market=US`);
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
    return this.apiRequest(`/playlists/${playlistId}`);
  }

  async getPlaylistTracks(playlistId: string, limit = 50, offset = 0) {
    return this.apiRequest<any>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  async getAlbum(albumId: string): Promise<SpotifyAlbum | null> {
    return this.apiRequest(`/albums/${albumId}`);
  }

  async getAlbumTracks(albumId: string, limit = 50) {
    return this.apiRequest<any>(`/albums/${albumId}/tracks?limit=${limit}`);
  }

  async getSavedTracks(limit = 50, offset = 0) {
    return this.apiRequest<any>(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  async getUserPlaylists(limit = 50, offset = 0) {
    return this.apiRequest<any>(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  async getFeaturedPlaylists(limit = 20) {
    return this.apiRequest<any>(`/browse/featured-playlists?limit=${limit}&country=US`);
  }

  async getCategoryPlaylists(categoryId: string, limit = 20) {
    return this.apiRequest<any>(`/browse/categories/${categoryId}/playlists?limit=${limit}&country=US`);
  }

  async getNewReleases(limit = 20) {
    return this.apiRequest<any>(`/browse/new-releases?limit=${limit}&country=US`);
  }

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

  async getRecentlyPlayed(limit = 20) {
    return this.apiRequest<any>(`/me/player/recently-played?limit=${limit}`);
  }

  async getTopTracks(timeRange = 'medium_term', limit = 20) {
    return this.apiRequest<any>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  async getAvailableGenreSeeds() {
    return this.apiRequest<any>('/recommendations/available-genre-seeds');
  }

  async play(uri?: string, contextUri?: string): Promise<boolean> {
    const body: any = {};
    if (contextUri) body.context_uri = contextUri;
    if (uri) body.uris = [uri];

    const result = await this.apiRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (result === null) {
      const devicesResult = await this.apiRequest<any>('/me/player/devices');
      const devices: any[] = devicesResult?.devices ?? [];
      if (devices.length === 0) return false;

      const deviceId = devices[0].id;
      await this.apiRequest('/me/player', {
        method: 'PUT',
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
      });

      const retry = await this.apiRequest('/me/player/play', {
        method: 'PUT',
        body: JSON.stringify({ ...body, device_id: deviceId }),
      });
      return retry !== null;
    }

    return true;
  }

  async pause() {
    return this.apiRequest('/me/player/pause', { method: 'PUT' });
  }

  async next() {
    return this.apiRequest('/me/player/next', { method: 'POST' });
  }

  async previous() {
    return this.apiRequest('/me/player/previous', { method: 'POST' });
  }

  async seek(positionMs: number) {
    return this.apiRequest(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });
  }

  async setVolume(volumePercent: number) {
    return this.apiRequest(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });
  }

  async getPlaybackState() {
    return this.apiRequest<any>('/me/player');
  }

  async getDevices() {
    return this.apiRequest<any>('/me/player/devices');
  }

  async transferPlayback(deviceId: string, play = true) {
    return this.apiRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async disconnect() {
    this.accessToken = null;
    this.expiresAt = 0;
    this.isConnected = false;
    await EncryptedStorage.removeItem(STORAGE_KEY);
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
