/**
 * Holy Culture Radio - Mini Player Component
 * Displays at the bottom of screens when audio is playing
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { usePlayer } from '../hooks/usePlayer';

export default function MiniPlayer() {
  const { playerState, togglePlayPause, isVisible } = usePlayer();

  if (!isVisible || !playerState.currentTrack) {
    return null;
  }

  const track = playerState.currentTrack;
  const isPlaying = playerState.isPlaying;

  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity style={styles.content} activeOpacity={0.9}>
        {/* Album Art / Thumbnail */}
        <View style={styles.imageContainer}>
          {'albumArt' in track && track.albumArt ? (
            <Image source={{ uri: track.albumArt }} style={styles.image} />
          ) : 'imageUrl' in track && track.imageUrl ? (
            <Image source={{ uri: track.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>HC</Text>
            </View>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {'name' in track ? track.name : track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {'artist' in track ? track.artist : 'Holy Culture Radio'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(playerState.progress / playerState.duration) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={togglePlayPause}
          >
            <View style={[styles.playButton, isPlaying && styles.pauseButton]}>
              {isPlaying ? (
                <View style={styles.pauseIcon}>
                  <View style={styles.pauseBar} />
                  <View style={styles.pauseBar} />
                </View>
              ) : (
                <View style={styles.playIcon} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Source Indicator */}
      <View style={styles.sourceIndicator}>
        <Text style={styles.sourceText}>
          {playerState.source === 'radio' && 'LIVE'}
          {playerState.source === 'podcast' && 'PODCAST'}
          {playerState.source === 'spotify' && 'SPOTIFY'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 88, // Above tab bar
    left: 0,
    right: 0,
    height: spacing.miniPlayerHeight,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  trackName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  trackArtist: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.playerBuffer,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: colors.primary,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: colors.textOnPrimary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pauseBar: {
    width: 4,
    height: 14,
    backgroundColor: colors.textOnPrimary,
    borderRadius: 1,
  },
  sourceIndicator: {
    position: 'absolute',
    top: 4,
    right: spacing.md,
  },
  sourceText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontSize: 8,
    letterSpacing: 1,
  },
});
