/**
 * Holy Culture Radio - Radio Screen
 * Live radio streaming via radio.net
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import TrackPlayer, {
  State,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { typography, spacing, shadows } from '../theme';
import { useColors } from '../hooks/useColors';
import { RADIO_STREAM_URL, RADIO_STATION_NAME } from '../config';
import {
  playRadioStream,
  stopRadioStream,
  startNowPlayingPolling,
  stopNowPlayingPolling,
  NowPlaying,
} from '../services/radioService';

const STREAM_CONFIGURED = RADIO_STREAM_URL !== 'REPLACE_WITH_STREAM_URL';

export default function RadioScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [playerState, setPlayerState] = useState<State>(State.None);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const isPlaying = playerState === State.Playing || playerState === State.Buffering;
  const isBuffering = playerState === State.Buffering || playerState === State.Loading;

  // ─── Pulse animation while live ───────────────────────────────────────────

  useEffect(() => {
    if (isPlaying) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => { pulseRef.current?.stop(); };
  }, [isPlaying]);

  // ─── TrackPlayer state sync ────────────────────────────────────────────────

  useTrackPlayerEvents([Event.PlaybackState], event => {
    setPlayerState(event.state);
    if (event.state === State.Playing || event.state === State.Buffering) {
      setIsLoading(false);
      setError(null);
    }
  });

  useTrackPlayerEvents([Event.PlaybackError], event => {
    setIsLoading(false);
    setError('Could not connect to the stream. Check your connection and try again.');
    if (__DEV__) console.warn('[Radio] Playback error:', event.message);
  });

  // ─── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopRadioStream();
      stopNowPlayingPolling();
    };
  }, []);

  // ─── Controls ─────────────────────────────────────────────────────────────

  const handlePlayPress = useCallback(async () => {
    if (!STREAM_CONFIGURED) {
      setError('Stream URL not yet configured. See config.ts.');
      return;
    }
    setError(null);
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      try {
        setIsLoading(true);
        await playRadioStream();
        startNowPlayingPolling(setNowPlaying);
      } catch (e: any) {
        setIsLoading(false);
        setError('Failed to start stream. Please try again.');
        if (__DEV__) console.error('[Radio] Play error:', e.message);
      }
    }
  }, [isPlaying]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Station logo + pulse ring */}
      <View style={styles.headerSection}>
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.liveRing, { transform: [{ scale: pulseAnim }] }, !isPlaying && styles.liveRingIdle]} />
          <View style={styles.logo}>
            <Text style={styles.logoText}>HC</Text>
          </View>
        </View>
        <Text style={styles.stationName}>{RADIO_STATION_NAME}</Text>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
          <Text style={styles.liveLabel}>{isPlaying ? 'LIVE' : 'ON AIR'}</Text>
        </View>
      </View>

      {/* Now Playing card */}
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>NOW PLAYING</Text>
        {nowPlaying ? (
          <>
            <Text style={styles.trackTitle} numberOfLines={2}>{nowPlaying.title}</Text>
            <Text style={styles.trackArtist}>{nowPlaying.artist}</Text>
          </>
        ) : (
          <>
            <Text style={styles.trackTitle}>Holy Culture Radio</Text>
            <Text style={styles.trackArtist}>Christian Hip-Hop · Gospel · R&B</Text>
          </>
        )}

        {/* Play / Pause button */}
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={handlePlayPress}
          activeOpacity={0.85}
        >
          {isLoading || isBuffering ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.playIcon} />
          )}
        </TouchableOpacity>

        {/* Error message */}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Buffering label */}
        {isBuffering && !error && (
          <Text style={styles.bufferingText}>Connecting to stream…</Text>
        )}

        {/* Audio visualizer bars (decorative, only while playing) */}
        {isPlaying && !isBuffering && (
          <View style={styles.visualizer}>
            {BARS.map((h, i) => (
              <View key={i} style={[styles.vizBar, { height: h, backgroundColor: colors.primary }]} />
            ))}
          </View>
        )}
      </View>

      {/* About section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Holy Culture Radio</Text>
        <Text style={styles.bodyText}>
          Holy Culture Radio is your home for the best in Christian Hip-Hop, Gospel, and R&B —
          24/7 music that uplifts, inspires, and celebrates faith. Stream live anywhere, anytime.
        </Text>
      </View>

      {/* Feature tiles */}
      {FEATURES.map(f => (
        <View key={f.title} style={styles.featureTile}>
          <Text style={styles.featureIcon}>{f.icon}</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🎵', title: '24/7 Music', desc: 'Non-stop Christian music around the clock' },
  { icon: '🎤', title: 'Live Shows', desc: 'Hosted shows with top DJs and artists' },
  { icon: '📡', title: 'Live Stream', desc: 'Crystal clear audio, anywhere in the world' },
];

// Fixed heights so the visualizer doesn't re-render randomly
const BARS = [14, 28, 20, 35, 18, 30, 12, 25, 32, 16, 28, 22, 36, 15, 26, 30, 18, 34, 20, 24];

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof import('../hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 40 },

    headerSection: { alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.xl },
    logoWrapper: { position: 'relative', marginBottom: spacing.lg, alignItems: 'center', justifyContent: 'center' },
    liveRing: {
      position: 'absolute',
      width: 144, height: 144, borderRadius: 72,
      borderWidth: 2, borderColor: colors.primary, opacity: 0.5,
    },
    liveRingIdle: { opacity: 0.15 },
    logo: {
      width: 120, height: 120, borderRadius: 60,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      ...shadows.glow,
    },
    logoText: { ...typography.h1, color: '#fff', fontWeight: '900' },
    stationName: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
    liveBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted, marginRight: spacing.sm },
    liveDotActive: { backgroundColor: '#FF4444' },
    liveLabel: { ...typography.label, color: colors.textPrimary, letterSpacing: 1 },

    card: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: spacing.cardBorderRadius,
      padding: spacing.lg,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center',
      marginBottom: spacing.lg,
      ...shadows.medium,
    },
    cardEyebrow: { ...typography.label, color: colors.primary, letterSpacing: 2, marginBottom: spacing.md },
    trackTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
    trackArtist: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
    playBtn: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: spacing.md,
      ...shadows.large,
    },
    playBtnActive: { backgroundColor: colors.primaryDark ?? colors.primary },
    playIcon: {
      width: 0, height: 0,
      borderLeftWidth: 24, borderTopWidth: 16, borderBottomWidth: 16,
      borderLeftColor: '#fff', borderTopColor: 'transparent', borderBottomColor: 'transparent',
      marginLeft: 6,
    },
    pauseIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pauseBar: { width: 8, height: 28, backgroundColor: '#fff', borderRadius: 2 },
    errorText: { ...typography.caption, color: colors.error ?? '#FF4444', textAlign: 'center', marginTop: spacing.sm },
    bufferingText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
    visualizer: {
      flexDirection: 'row', alignItems: 'flex-end',
      justifyContent: 'center', height: 40,
      marginTop: spacing.md, gap: 3,
    },
    vizBar: { width: 4, borderRadius: 2, opacity: 0.7 },

    section: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
    bodyText: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

    featureTile: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: spacing.cardBorderRadius,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1, borderColor: colors.border,
    },
    featureIcon: { fontSize: 28, marginRight: spacing.md },
    featureText: { flex: 1 },
    featureTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    featureDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  });
