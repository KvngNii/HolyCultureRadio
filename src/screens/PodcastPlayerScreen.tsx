/**
 * Holy Culture Radio - Podcast Player Screen
 * Full-screen podcast playback with controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../theme';
import { RootStackParamList } from '../types';
import { usePlayer } from '../hooks/usePlayer';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - spacing.screenPadding * 4;

type PodcastPlayerRouteProp = RouteProp<RootStackParamList, 'PodcastPlayer'>;

// Mock episode data
const mockEpisode = {
  id: '1',
  podcastId: '1',
  podcastTitle: 'Faith & Culture Today',
  title: 'Finding Your Purpose in 2024',
  description: 'A deep dive into discovering God\'s purpose for your life in the new year. Pastor James Wilson shares biblical insights and practical steps for uncovering your calling.',
  audioUrl: 'https://example.com/episode1.mp3',
  duration: 2700, // 45 minutes
  publishedAt: new Date(),
  host: 'Pastor James Wilson',
};

export default function PodcastPlayerScreen() {
  const route = useRoute<PodcastPlayerRouteProp>();
  const navigation = useNavigation();
  const { playerState, play, togglePlayPause, seek } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animate artwork when playing
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isPlaying]);

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= mockEpisode.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    togglePlayPause();
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(mockEpisode.duration, prev + seconds)));
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / mockEpisode.duration) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>▼</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.playingFrom}>PLAYING FROM PODCAST</Text>
          <Text style={styles.podcastName}>{mockEpisode.podcastTitle}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View
          style={[
            styles.artwork,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.artworkEmoji}>🎙️</Text>
          <View style={styles.artworkOverlay}>
            <Text style={styles.artworkText}>HC</Text>
          </View>
        </Animated.View>
      </View>

      {/* Episode Info */}
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle} numberOfLines={2}>{mockEpisode.title}</Text>
        <Text style={styles.episodeHost}>{mockEpisode.host}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <TouchableOpacity
            style={styles.progressBarTouchable}
            onPress={(e) => {
              const locationX = e.nativeEvent.locationX;
              const barWidth = width - spacing.screenPadding * 4;
              const newProgress = (locationX / barWidth) * mockEpisode.duration;
              setCurrentTime(Math.max(0, Math.min(mockEpisode.duration, newProgress)));
            }}
          >
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <View
              style={[
                styles.progressThumb,
                { left: `${progress}%`, marginLeft: -8 },
              ]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.timeLabels}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>-{formatTime(mockEpisode.duration - currentTime)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Speed Control */}
        <TouchableOpacity style={styles.speedButton} onPress={cyclePlaybackSpeed}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        {/* Skip Back */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleSeek(-15)}
        >
          <Text style={styles.skipIcon}>↺</Text>
          <Text style={styles.skipText}>15</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.playIcon} />
          )}
        </TouchableOpacity>

        {/* Skip Forward */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleSeek(30)}
        >
          <Text style={styles.skipIcon}>↻</Text>
          <Text style={styles.skipText}>30</Text>
        </TouchableOpacity>

        {/* Sleep Timer */}
        <TouchableOpacity style={styles.timerButton}>
          <Text style={styles.timerIcon}>🌙</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionTitle}>Episode Description</Text>
        <Text style={styles.descriptionText}>{mockEpisode.description}</Text>
      </View>

      {/* Additional Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Chapters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.textPrimary,
    fontSize: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  playingFrom: {
    ...typography.labelSmall,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  podcastName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: spacing.cardBorderRadius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.large,
  },
  artworkEmoji: {
    fontSize: 80,
    opacity: 0.3,
  },
  artworkOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkText: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.textOnPrimary,
    opacity: 0.8,
  },
  episodeInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  episodeTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  episodeHost: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressSection: {
    paddingHorizontal: spacing.screenPadding * 2,
    marginBottom: spacing.lg,
  },
  progressBarContainer: {
    height: 30,
    justifyContent: 'center',
  },
  progressBarTouchable: {
    height: 30,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.playerBuffer,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    top: 7,
    ...shadows.small,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  speedButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  speedText: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  skipButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipIcon: {
    fontSize: 32,
    color: colors.textPrimary,
  },
  skipText: {
    position: 'absolute',
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftColor: colors.textOnPrimary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 6,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseBar: {
    width: 8,
    height: 28,
    backgroundColor: colors.textOnPrimary,
    borderRadius: 2,
  },
  timerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerIcon: {
    fontSize: 24,
  },
  descriptionSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  descriptionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
