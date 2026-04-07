/**
 * Holy Culture Radio - Spotify Player Service
 * Wraps react-native-spotify-remote for full in-app track playback.
 * Requires Spotify app installed + Spotify Premium.
 */

import { remote, PlayerState } from 'react-native-spotify-remote';

class SpotifyPlayerService {
  private _isConnected = false;

  /**
   * Connect the remote to the Spotify app using the current access token.
   * Call this after successful Spotify auth.
   */
  async connect(accessToken: string): Promise<boolean> {
    try {
      await remote.connect(accessToken);
      this._isConnected = true;
      console.log('[SpotifyPlayer] Remote connected');
      return true;
    } catch (error) {
      console.error('[SpotifyPlayer] Failed to connect remote:', error);
      this._isConnected = false;
      return false;
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

  async ensureConnected(accessToken: string): Promise<boolean> {
    if (this._isConnected) {
      const connected = await remote.isConnectedAsync().catch(() => false);
      if (connected) return true;
    }
    return this.connect(accessToken);
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
