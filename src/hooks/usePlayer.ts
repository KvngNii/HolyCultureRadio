/**
 * Holy Culture Radio - Player Hook
 * Manages audio playback state across the app
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { PlayerState, SpotifyTrack, PodcastEpisode } from '../types';

interface PlayerContextType {
  playerState: PlayerState;
  isVisible: boolean;
  play: (track: SpotifyTrack | PodcastEpisode, source: PlayerState['source']) => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  playRadio: () => void;
  stop: () => void;
}

const initialState: PlayerState = {
  isPlaying: false,
  currentTrack: undefined,
  progress: 0,
  duration: 0,
  volume: 1,
  repeatMode: 'off',
  shuffleEnabled: false,
  source: null,
};

// Singleton state for the player (in production, use proper state management like Redux or Zustand)
let globalPlayerState = initialState;
let listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export function usePlayer(): PlayerContextType {
  const [playerState, setPlayerState] = useState<PlayerState>(globalPlayerState);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const listener = () => {
      setPlayerState({ ...globalPlayerState });
      setIsVisible(globalPlayerState.currentTrack !== undefined || globalPlayerState.source === 'radio');
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const play = useCallback((track: SpotifyTrack | PodcastEpisode, source: PlayerState['source']) => {
    globalPlayerState = {
      ...globalPlayerState,
      isPlaying: true,
      currentTrack: track,
      source,
      progress: 0,
      duration: track.duration,
    };
    notifyListeners();
  }, []);

  const pause = useCallback(() => {
    globalPlayerState = {
      ...globalPlayerState,
      isPlaying: false,
    };
    notifyListeners();
  }, []);

  const togglePlayPause = useCallback(() => {
    globalPlayerState = {
      ...globalPlayerState,
      isPlaying: !globalPlayerState.isPlaying,
    };
    notifyListeners();
  }, []);

  const seek = useCallback((position: number) => {
    globalPlayerState = {
      ...globalPlayerState,
      progress: position,
    };
    notifyListeners();
  }, []);

  const setVolume = useCallback((volume: number) => {
    globalPlayerState = {
      ...globalPlayerState,
      volume: Math.max(0, Math.min(1, volume)),
    };
    notifyListeners();
  }, []);

  const playRadio = useCallback(() => {
    globalPlayerState = {
      ...globalPlayerState,
      isPlaying: true,
      source: 'radio',
      currentTrack: undefined,
    };
    notifyListeners();
  }, []);

  const stop = useCallback(() => {
    globalPlayerState = initialState;
    notifyListeners();
  }, []);

  return {
    playerState,
    isVisible,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    playRadio,
    stop,
  };
}

export default usePlayer;
