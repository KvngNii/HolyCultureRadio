/**
 * Holy Culture Radio — Podcasts Screen
 *
 * Fetches all Holy Culture podcasts from the Megaphone API, lets the user
 * browse shows, and tap episodes to open the full player.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { typography, spacing, shadows } from '../theme';
import { useColors } from '../hooks/useColors';
import { RootStackParamList, MegaphonePodcast, MegaphoneEpisode } from '../types';
import {
  getPodcasts,
  getEpisodes,
  clearMegaphoneCache,
  formatDuration,
  formatPubDate,
} from '../services/megaphoneService';

const { width } = Dimensions.get('window');
const PODCAST_CARD_SIZE = width * 0.38;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PodcastsScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [podcasts, setPodcasts] = useState<MegaphonePodcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<MegaphonePodcast | null>(null);
  const [episodes, setEpisodes] = useState<MegaphoneEpisode[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [podcastError, setPodcastError] = useState<string | null>(null);

  // ─── Load podcasts on mount ──────────────────────────────────────────────

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = useCallback(async (forceRefresh = false) => {
    try {
      setPodcastError(null);
      const data = await getPodcasts(forceRefresh);
      setPodcasts(data);
      // Auto-select the first podcast
      if (data.length > 0 && !selectedPodcast) {
        selectPodcast(data[0]);
      }
    } catch (err: any) {
      setPodcastError('Could not load podcasts. Check your connection.');
      console.error('[Podcasts] Load error:', err?.message);
    } finally {
      setLoadingPodcasts(false);
      setRefreshing(false);
    }
  }, [selectedPodcast]);

  const selectPodcast = useCallback(async (podcast: MegaphonePodcast, forceRefresh = false) => {
    setSelectedPodcast(podcast);
    setEpisodes([]);
    setLoadingEpisodes(true);
    try {
      const eps = await getEpisodes(podcast.id, 1, 20, forceRefresh);
      setEpisodes(eps);
    } catch (err: any) {
      console.error('[Podcasts] Episodes load error:', err?.message);
    } finally {
      setLoadingEpisodes(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await clearMegaphoneCache();
    await loadPodcasts(true);
    if (selectedPodcast) {
      await selectPodcast(selectedPodcast, true);
    }
  }, [loadPodcasts, selectPodcast, selectedPodcast]);

  const openEpisode = useCallback((episode: MegaphoneEpisode) => {
    if (!selectedPodcast) return;
    navigation.navigate('PodcastPlayer', {
      episodeId: episode.id,
      podcastId: episode.podcastId,
    });
  }, [navigation, selectedPodcast]);

  // ─── Render helpers ──────────────────────────────────────────────────────

  const renderPodcastCard = ({ item }: { item: MegaphonePodcast }) => {
    const isSelected = selectedPodcast?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.podcastCard, isSelected && styles.podcastCardSelected]}
        onPress={() => selectPodcast(item)}
        activeOpacity={0.8}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.podcastImage} resizeMode="cover" />
        ) : (
          <View style={[styles.podcastImage, styles.podcastImagePlaceholder]}>
            <Text style={styles.podcastImagePlaceholderText}>🎙</Text>
          </View>
        )}
        <Text style={[styles.podcastTitle, isSelected && styles.podcastTitleSelected]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.episodeCount > 0 && (
          <Text style={styles.podcastEpisodeCount}>{item.episodeCount} episodes</Text>
        )}
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderEpisode = ({ item }: { item: MegaphoneEpisode }) => (
    <TouchableOpacity
      style={styles.episodeCard}
      onPress={() => openEpisode(item)}
      activeOpacity={0.85}
    >
      {/* Artwork */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.episodeArt} resizeMode="cover" />
      ) : selectedPodcast?.imageUrl ? (
        <Image source={{ uri: selectedPodcast.imageUrl }} style={styles.episodeArt} resizeMode="cover" />
      ) : (
        <View style={[styles.episodeArt, styles.episodeArtPlaceholder]}>
          <Text style={{ fontSize: 24 }}>🎙</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.episodeInfo}>
        {item.episodeNumber != null && (
          <Text style={styles.episodeNumber}>EP {item.episodeNumber}</Text>
        )}
        <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
        {!!item.summary && (
          <Text style={styles.episodeSummary} numberOfLines={2}>{item.summary}</Text>
        )}
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeMetaText}>{formatPubDate(item.pubDate)}</Text>
          {item.duration > 0 && (
            <>
              <Text style={styles.episodeMetaDot}>·</Text>
              <Text style={styles.episodeMetaText}>{formatDuration(item.duration)}</Text>
            </>
          )}
        </View>
      </View>

      {/* Play button */}
      <View style={styles.playBtn}>
        <Text style={styles.playBtnIcon}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Loading / error states ──────────────────────────────────────────────

  if (loadingPodcasts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading podcasts…</Text>
      </View>
    );
  }

  if (podcastError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>📡</Text>
        <Text style={styles.errorTitle}>Couldn't Load Podcasts</Text>
        <Text style={styles.errorText}>{podcastError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoadingPodcasts(true); loadPodcasts(true); }}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      {/* Podcast row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Holy Culture Podcasts</Text>
        <FlatList
          data={podcasts}
          keyExtractor={p => p.id}
          renderItem={renderPodcastCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.podcastRow}
        />
      </View>

      {/* Episode list for selected podcast */}
      {selectedPodcast && (
        <View style={styles.section}>
          <View style={styles.episodeHeader}>
            <Text style={styles.sectionTitle}>{selectedPodcast.title}</Text>
            {!!selectedPodcast.summary && (
              <Text style={styles.podcastDescription} numberOfLines={3}>
                {selectedPodcast.summary}
              </Text>
            )}
          </View>

          {loadingEpisodes ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : episodes.length === 0 ? (
            <View style={styles.emptyEpisodes}>
              <Text style={styles.emptyText}>No episodes found for this podcast.</Text>
            </View>
          ) : (
            episodes.map(ep => (
              <View key={ep.id}>{renderEpisode({ item: ep })}</View>
            ))
          )}
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof import('../hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    errorIcon: { fontSize: 48, marginBottom: spacing.md },
    errorTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
    errorText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
    retryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: spacing.round,
    },
    retryBtnText: { ...typography.button, color: '#fff' },

    section: { marginBottom: spacing.lg },
    sectionTitle: {
      ...typography.h4,
      color: colors.textPrimary,
      paddingHorizontal: spacing.screenPadding,
      marginBottom: spacing.md,
    },

    // Podcast cards
    podcastRow: { paddingHorizontal: spacing.screenPadding, gap: spacing.md },
    podcastCard: {
      width: PODCAST_CARD_SIZE,
      marginRight: spacing.md,
    },
    podcastCardSelected: {},
    podcastImage: {
      width: PODCAST_CARD_SIZE,
      height: PODCAST_CARD_SIZE,
      borderRadius: spacing.cardBorderRadius,
      backgroundColor: colors.backgroundSecondary,
      marginBottom: spacing.sm,
    },
    podcastImagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    podcastImagePlaceholderText: { fontSize: 40 },
    podcastTitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    podcastTitleSelected: { color: colors.primary },
    podcastEpisodeCount: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    selectedIndicator: {
      height: 3,
      backgroundColor: colors.primary,
      borderRadius: 2,
      marginTop: spacing.xs,
    },

    // Episode list
    episodeHeader: { paddingHorizontal: spacing.screenPadding, marginBottom: spacing.sm },
    podcastDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    episodeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      marginHorizontal: spacing.screenPadding,
      marginBottom: spacing.sm,
      borderRadius: spacing.cardBorderRadius,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.small,
    },
    episodeArt: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    episodeArtPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    episodeInfo: { flex: 1, marginHorizontal: spacing.md },
    episodeNumber: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
      marginBottom: 2,
    },
    episodeTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 4 },
    episodeSummary: { ...typography.caption, color: colors.textSecondary, lineHeight: 16, marginBottom: 4 },
    episodeMeta: { flexDirection: 'row', alignItems: 'center' },
    episodeMetaText: { ...typography.caption, color: colors.textMuted },
    episodeMetaDot: { color: colors.textMuted, marginHorizontal: 4 },
    playBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playBtnIcon: { color: '#fff', fontSize: 13, marginLeft: 2 },
    emptyEpisodes: { padding: spacing.xl, alignItems: 'center' },
    emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  });
