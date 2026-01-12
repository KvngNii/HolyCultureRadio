/**
 * Holy Culture Radio - Radio Screen
 * Live radio streaming from SiriusXM
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';
import { usePlayer } from '../hooks/usePlayer';
import { Show, ShowSchedule } from '../types';

const { width } = Dimensions.get('window');

// Mock schedule data
const mockSchedule: ShowSchedule[] = [
  {
    dayOfWeek: 0, // Sunday
    shows: [
      {
        id: '1',
        title: 'Sunday Morning Worship',
        host: 'DJ Holy',
        description: 'Start your Sunday with uplifting worship music',
        imageUrl: '',
        startTime: new Date('2024-01-01T06:00:00'),
        endTime: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        title: 'Gospel Hour',
        host: 'Sister Grace',
        description: 'Traditional and contemporary gospel favorites',
        imageUrl: '',
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T14:00:00'),
      },
    ],
  },
];

const currentShow: Show = {
  id: '1',
  title: 'Holy Culture Live',
  host: 'DJ Promote',
  description: 'The best in Christian Hip-Hop, R&B, and Gospel music',
  imageUrl: '',
  startTime: new Date(),
  endTime: new Date(Date.now() + 3600000),
};

export default function RadioScreen() {
  const { playerState, playRadio, togglePlayPause, stop } = usePlayer();
  const [isLive, setIsLive] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for live indicator
  useEffect(() => {
    if (isLive && playerState.isPlaying && playerState.source === 'radio') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLive, playerState.isPlaying, playerState.source]);

  const handlePlayPress = () => {
    if (playerState.source === 'radio' && playerState.isPlaying) {
      togglePlayPause();
    } else {
      playRadio();
    }
  };

  const isPlaying = playerState.source === 'radio' && playerState.isPlaying;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Station Header */}
      <View style={styles.stationHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>HC</Text>
          </View>
          {isLive && (
            <Animated.View
              style={[
                styles.liveRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}
        </View>
        <Text style={styles.stationName}>Holy Culture Radio</Text>
        <Text style={styles.stationChannel}>SiriusXM Channel 154</Text>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
          <Text style={styles.liveText}>{isPlaying ? 'PLAYING LIVE' : 'LIVE'}</Text>
        </View>
      </View>

      {/* Now Playing Card */}
      <View style={styles.nowPlayingCard}>
        <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
        <Text style={styles.showTitle}>{currentShow.title}</Text>
        <Text style={styles.showHost}>with {currentShow.host}</Text>
        <Text style={styles.showDescription}>{currentShow.description}</Text>

        {/* Play Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlayPress}
            activeOpacity={0.8}
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
        </View>

        {/* Audio Visualizer (Decorative) */}
        {isPlaying && (
          <View style={styles.visualizer}>
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.visualizerBar,
                  {
                    height: Math.random() * 30 + 10,
                    animationDelay: `${i * 50}ms`,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Station Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>About Holy Culture Radio</Text>
        <Text style={styles.infoText}>
          Holy Culture Radio is your destination for the best in Christian Hip-Hop,
          Gospel, R&B, and inspirational music. Broadcasting 24/7 on SiriusXM Channel 154,
          we bring you the sounds that uplift, inspire, and celebrate faith through music.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎵</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>24/7 Music</Text>
            <Text style={styles.featureDescription}>Non-stop Christian music around the clock</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎤</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Live Shows</Text>
            <Text style={styles.featureDescription}>Hosted shows with top DJs and artists</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📡</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>SiriusXM Quality</Text>
            <Text style={styles.featureDescription}>Crystal clear satellite radio streaming</Text>
          </View>
        </View>
      </View>

      {/* Schedule Preview */}
      <View style={styles.scheduleSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Full Schedule</Text>
          </TouchableOpacity>
        </View>

        {mockSchedule[0]?.shows.map((show) => (
          <View key={show.id} style={styles.scheduleItem}>
            <View style={styles.scheduleTime}>
              <Text style={styles.timeText}>
                {show.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{show.title}</Text>
              <Text style={styles.scheduleHost}>with {show.host}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* SiriusXM Notice */}
      <View style={styles.noticeSection}>
        <Text style={styles.noticeTitle}>SiriusXM Subscription Required</Text>
        <Text style={styles.noticeText}>
          To listen to Holy Culture Radio, you need an active SiriusXM subscription
          that includes streaming access. Don't have one yet?
        </Text>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Subscribe to SiriusXM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stationHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  logoText: {
    ...typography.h1,
    color: colors.textOnPrimary,
    fontWeight: '900',
  },
  liveRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.5,
  },
  stationName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stationChannel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
    marginRight: spacing.sm,
  },
  liveDotActive: {
    backgroundColor: '#FF4444',
  },
  liveText: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  nowPlayingCard: {
    margin: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    ...typography.labelSmall,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  showTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  showHost: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  showDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  controls: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
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
    alignItems: 'center',
    gap: 8,
  },
  pauseBar: {
    width: 8,
    height: 28,
    backgroundColor: colors.textOnPrimary,
    borderRadius: 2,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    marginTop: spacing.md,
    gap: 2,
  },
  visualizerBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
  infoSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featuresSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.label,
    color: colors.primary,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleTime: {
    width: 70,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  scheduleHost: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noticeSection: {
    margin: spacing.screenPadding,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.buttonBorderRadius,
    alignItems: 'center',
  },
  subscribeButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  bottomSpacing: {
    height: 120,
  },
});
