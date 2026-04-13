/**
 * Holy Culture Radio - Spotify Player Service
 * Wraps react-native-spotify-remote for full in-app track playback.
 * Requires Spotify app installed + Spotify Premium.
 */

import { remote, auth, ApiScope, PlayerState } from 'react-native-spotify-remote';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '../config';

const SPOTIFY_CONFIG = {
  clientID: SPOTIFY_CLIENT_ID,
  redirectURL: SPOTIFY_REDIRECT_URI,
  scopes: [
    ApiScope.AppRemoteControlScope,
    ApiScope.StreamingScope,
    ApiScope.UserReadPrivateScope,
    ApiScope.UserReadEmailScope,
    ApiScope.UserReadPlaybackStateScope,
    ApiScope.UserModifyPlaybackStateScope,
    ApiScope.UserReadRecentlyPlayedScope,
    ApiScope.PlaylistReadPrivateScope,
    ApiScope.UserLibraryReadScope,
  ],
};

class SpotifyPlayerService {
  private _isConnected = false;

  /**
   * Authorize via the SDK's auth module and connect the remote.
   * Must be called before any playback. auth.authorize() will reuse
   * an existing session silently if the user is already logged in.
   */
  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      const session = await auth.authorize(SPOTIFY_CONFIG);
      await remote.connect(session.accessToken);
      this._isConnected = true;
      console.log('[SpotifyPlayer] Remote connected');
      return { success: true };
    } catch (error: any) {
      const message = error?.message ?? String(error);
      console.error('[SpotifyPlayer] Failed to connect remote:', message);
      this._isConnected = false;
      return { success: false, error: message };
    }
  }

  async disconnect(): Promise<void> {
    try {
      await remote.disconnect();
    } catch (_) {}
    this._isConnected = false;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async ensureConnected(): Promise<{ success: boolean; error?: string }> {
    if (this._isConnected) {
      const connected = await remote.isConnectedAsync().catch(() => false);
      if (connected) return { success: true };
    }
    return this.connect();
  }

  async playUri(spotifyUri: string): Promise<void> {
    await remote.playUri(spotifyUri);
  }

  async pause(): Promise<void> {
    await remote.pause();
  }

  async resume(): Promise<void> {
    await remote.resume();
  }

  async skipToNext(): Promise<void> {
    await remote.skipToNext();
  }

  async skipToPrevious(): Promise<void> {
    await remote.skipToPrevious();
  }

  async seek(positionMs: number): Promise<void> {
    await remote.seek(positionMs);
  }

  async getPlayerState(): Promise<PlayerState | null> {
    try {
      return await remote.getPlayerState();
    } catch {
      return null;
    }
  }

  onPlayerStateChanged(callback: (state: PlayerState) => void) {
    remote.on('playerStateChanged', callback);
    return () => remote.removeAllListeners('playerStateChanged');
  }

  onRemoteDisconnected(callback: () => void) {
    remote.on('remoteDisconnected', callback);
    return () => remote.removeAllListeners('remoteDisconnected');
  }
}

export const spotifyPlayer = new SpotifyPlayerService();
