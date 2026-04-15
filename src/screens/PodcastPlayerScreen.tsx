/**
 * Holy Culture Radio — Podcast Player Screen
 *
 * Full-screen player for a single Megaphone episode.
 * Uses react-native-track-player for background-capable audio playback.
 *
 * Route params: { episodeId, podcastId }
 * The episode is resolved from the Megaphone service cache (no extra network
 * request if the user just came from PodcastsScreen).
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import TrackPlayer, {
  State,
  Event,
  useTrackPlayerEvents,
  useProgress,
  RepeatMode,
  Capability,
} from 'react-native-track-player';
import { typography, spacing } from '../theme';
import { useColors } from '../hooks/useColors';
import { RootStackParamList, MegaphoneEpisode, MegaphonePodcast } from '../types';
import { getEpisode, getPodcasts, formatDuration, formatPubDate } from '../services/megaphoneService';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - spacing.screenPadding * 4;

type Route = RouteProp<RootStackParamList, 'PodcastPlayer'>;

// Playback speeds available
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// ─── Pure-RN seek bar (no extra native dependency) ────────────────────────────

interface SeekBarProps {
  value: number; // 0–1
  trackColor: string;
  fillColor: string;
  thumbColor: string;
  onSeekStart: () => void;
  onValueChange: (v: number) => void;
  onSeekComplete: (v: number) => void;
}

function SeekBar({ value, trackColor, fillColor, thumbColor, onSeekStart, onValueChange, onSeekComplete }: SeekBarProps) {
  const [barWidth, setBarWidth] = useState(1);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const pct = `${clamp(value) * 100}%` as `${number}%`;
  const thumbLeft = clamp(value) * barWidth - 8;

  return (
    <View
      style={{ height: 40, justifyContent: 'center' }}
      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={e => {
        onSeekStart();
        onValueChange(clamp(e.nativeEvent.locationX / barWidth));
      }}
      onResponderMove={e => onValueChange(clamp(e.nativeEvent.locationX / barWidth))}
      onResponderRelease={e => onSeekComplete(clamp(e.nativeEvent.locationX / barWidth))}
    >
      <View style={{ height: 4, backgroundColor: trackColor, borderRadius: 2 }}>
        <View style={{ width: pct, height: 4, backgroundColor: fillColor, borderRadius: 2 }} />
      </View>
      <View style={{
        position: 'absolute',
        left: thumbLeft,
        top: 12,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: thumbColor,
      }} />
    </View>
  );
}

export default function PodcastPlayerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { episodeId, podcastId } = route.params;

  const [episode, setEpisode] = useState<MegaphoneEpisode | null>(null);
  const [podcast, setPodcast] = useState<MegaphonePodcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1×
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const progress = useProgress(250); // update every 250ms
  const setupDone = useRef(false);

  // ─── Load episode data then set up TrackPlayer ──────────────────────────

  useEffect(() => {
    (async () => {
      try {
        // Resolve episode from cache (fast) or API
        const ep = await getEpisode(podcastId, episodeId);
        setEpisode(ep);

        // Resolve podcast artwork
        const podcasts = await getPodcasts();
        const pod = podcasts.find(p => p.id === podcastId) ?? null;
        setPodcast(pod);

        if (ep && !setupDone.current) {
          setupDone.current = true;
          await setupPlayer(ep, pod);
        }
      } catch (err) {
        console.error('[PodcastPlayer] Load error:', err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      // Stop and reset when leaving the screen
      TrackPlayer.reset().catch(() => {});
      setupDone.current = false;
    };
  }, [episodeId, podcastId]);

  const setupPlayer = async (ep: MegaphoneEpisode, pod: MegaphonePodcast | null) => {
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
        ],
      });

      await TrackPlayer.add({
        id: ep.id,
        url: ep.audioUrl,
        title: ep.title,
        artist: pod?.title ?? 'Holy Culture Radio',
        artwork: ep.imageUrl || pod?.imageUrl || undefined,
        duration: ep.duration,
      });

      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      await TrackPlayer.play();
      setIsPlaying(true);
      setPlayerReady(true);
    } catch (err) {
      console.error('[PodcastPlayer] Setup error:', err);
      setPlayerReady(true); // still render UI even if setup fails
    }
  };

  // ─── Listen to playback state events ────────────────────────────────────

  useTrackPlayerEvents([Event.PlaybackState], event => {
    const playing = event.state === State.Playing || event.state === State.Buffering;
    setIsPlaying(playing);
  });

  // ─── Controls ────────────────────────────────────────────────────────────

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  const skipBack = useCallback(async () => {
    const pos = Math.max(0, progress.position - 15);
    await TrackPlayer.seekTo(pos);
  }, [progress.position]);

  const skipForward = useCallback(async () => {
    const pos = Math.min(progress.duration, progress.position + 30);
    await TrackPlayer.seekTo(pos);
  }, [progress.position, progress.duration]);

  const cycleSpeed = useCallback(async () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    await TrackPlayer.setRate(SPEEDS[next]);
  }, [speedIndex]);

  const onSeekStart = useCallback(() => {
    setIsSeeking(true);
    setSeekValue(progress.position);
  }, [progress.position]);

  const onSeekComplete = useCallback(async (value: number) => {
    setIsSeeking(false);
    await TrackPlayer.seekTo(value);
  }, []);

  const displayPosition = isSeeking ? seekValue : progress.position;
  const displayDuration = progress.duration > 0 ? progress.duration : (episode?.duration ?? 0);
  const sliderValue = displayDuration > 0 ? displayPosition / displayDuration : 0;

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading episode…</Text>
      </View>
    );
  }

  if (!episode) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>🎙</Text>
        <Text style={styles.errorText}>Episode not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const artworkUri = episode.imageUrl || podcast?.imageUrl;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {artworkUri ? (
          <Image source={{ uri: artworkUri }} style={styles.artwork} resizeMode="cover" />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Text style={styles.artworkPlaceholderText}>🎙</Text>
          </View>
        )}
      </View>

      {/* Podcast name */}
      <Text style={styles.podcastName} numberOfLines={1}>
        {podcast?.title ?? 'Holy Culture Radio'}
      </Text>

      {/* Episode title */}
      <Text style={styles.episodeTitle} numberOfLines={3}>
        {episode.title}
      </Text>

      {/* Episode meta */}
      <Text style={styles.episodeMeta}>
        {formatPubDate(episode.pubDate)}
        {episode.duration > 0 ? `  ·  ${formatDuration(episode.duration)}` : ''}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <SeekBar
          value={sliderValue}
          fillColor={colors.primary}
          trackColor={colors.border}
          thumbColor={colors.primary}
          onSeekStart={onSeekStart}
          onValueChange={v => setSeekValue(v * displayDuration)}
          onSeekComplete={v => onSeekComplete(v * displayDuration)}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatDuration(displayPosition)}</Text>
          <Text style={styles.timeText}>
            -{formatDuration(Math.max(0, displayDuration - displayPosition))}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Skip back 15s */}
        <TouchableOpacity style={styles.skipBtn} onPress={skipBack}>
          <Text style={styles.skipBtnIcon}>↩</Text>
          <Text style={styles.skipBtnLabel}>15</Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        {!playerReady ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.playBtn} />
        ) : (
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.8}>
            <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        )}

        {/* Skip forward 30s */}
        <TouchableOpacity style={styles.skipBtn} onPress={skipForward}>
          <Text style={styles.skipBtnIcon}>↪</Text>
          <Text style={styles.skipBtnLabel}>30</Text>
        </TouchableOpacity>
      </View>

      {/* Speed control */}
      <TouchableOpacity style={styles.speedBtn} onPress={cycleSpeed}>
        <Text style={styles.speedBtnText}>{SPEEDS[speedIndex]}×</Text>
      </TouchableOpacity>

      {/* Show notes */}
      {!!episode.summary && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>About this episode</Text>
          <Text style={styles.notesText}>{episode.summary}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof import('../hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.screenPadding * 2, paddingBottom: 80 },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: spacing.xl,
    },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    errorIcon: { fontSize: 48, marginBottom: spacing.md },
    errorText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
    backBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: spacing.round,
    },
    backBtnText: { ...typography.button, color: '#fff' },

    artworkContainer: {
      marginTop: spacing.xl,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    artwork: {
      width: ARTWORK_SIZE,
      height: ARTWORK_SIZE,
      borderRadius: 16,
      backgroundColor: colors.backgroundSecondary,
    },
    artworkPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    artworkPlaceholderText: { fontSize: 80 },

    podcastName: {
      ...typography.label,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.xs,
      fontWeight: '600',
    },
    episodeTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.xs,
      lineHeight: 28,
    },
    episodeMeta: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },

    progressContainer: { marginBottom: spacing.lg },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
    timeText: { ...typography.caption, color: colors.textMuted },

    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
      marginBottom: spacing.lg,
    },
    skipBtn: { alignItems: 'center' },
    skipBtnIcon: { fontSize: 26, color: colors.textPrimary },
    skipBtnLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10, marginTop: -4 },
    playBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playBtnIcon: { fontSize: 28, color: '#fff' },

    speedBtn: {
      alignSelf: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: spacing.round,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xl,
    },
    speedBtnText: { ...typography.label, color: colors.textPrimary, fontWeight: '700' },

    notes: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notesTitle: { ...typography.label, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
    notesText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  });
