/**
 * Holy Culture Radio - Podcasts Screen
 * Browse and listen to Holy Culture podcasts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, shadows } from '../theme';
import { RootStackParamList, Podcast, PodcastEpisode } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock podcasts data
const mockPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Faith & Culture Today',
    description: 'Exploring the intersection of faith and modern culture with thought-provoking discussions.',
    host: 'Pastor James Wilson',
    imageUrl: '',
    category: 'Discussion',
    isSubscribed: true,
    episodes: [],
  },
  {
    id: '2',
    title: 'Gospel Music Hour',
    description: 'The best in contemporary and traditional gospel music with artist interviews.',
    host: 'Sister Maria',
    imageUrl: '',
    category: 'Music',
    isSubscribed: false,
    episodes: [],
  },
  {
    id: '3',
    title: 'Youth Ministry',
    description: 'Equipping the next generation with biblical truth and practical wisdom.',
    host: 'DJ Holy',
    imageUrl: '',
    category: 'Youth',
    isSubscribed: true,
    episodes: [],
  },
  {
    id: '4',
    title: 'Prayer Warriors',
    description: 'A daily prayer podcast to start your morning with God.',
    host: 'Elder Thompson',
    imageUrl: '',
    category: 'Prayer',
    isSubscribed: false,
    episodes: [],
  },
];

const mockEpisodes: PodcastEpisode[] = [
  {
    id: '1',
    podcastId: '1',
    title: 'Finding Your Purpose in 2024',
    description: 'A deep dive into discovering God\'s purpose for your life in the new year.',
    audioUrl: 'https://example.com/episode1.mp3',
    duration: 2700, // 45 minutes
    publishedAt: new Date(),
    isPlayed: false,
    playProgress: 0,
  },
  {
    id: '2',
    podcastId: '1',
    title: 'Social Media & Faith',
    description: 'How to be a light in the digital world while staying grounded in faith.',
    audioUrl: 'https://example.com/episode2.mp3',
    duration: 3600, // 60 minutes
    publishedAt: new Date(Date.now() - 604800000), // 1 week ago
    isPlayed: true,
    playProgress: 1800,
  },
  {
    id: '3',
    podcastId: '2',
    title: 'Interview with Kirk Franklin',
    description: 'An exclusive conversation with gospel legend Kirk Franklin.',
    audioUrl: 'https://example.com/episode3.mp3',
    duration: 4200, // 70 minutes
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    isPlayed: false,
    playProgress: 0,
  },
  {
    id: '4',
    podcastId: '3',
    title: 'Dealing with Peer Pressure',
    description: 'Biblical strategies for young people facing peer pressure.',
    audioUrl: 'https://example.com/episode4.mp3',
    duration: 1800, // 30 minutes
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    isPlayed: false,
    playProgress: 0,
  },
  {
    id: '5',
    podcastId: '4',
    title: 'Morning Prayer: Peace',
    description: 'A guided prayer for peace and calm in your day.',
    audioUrl: 'https://example.com/episode5.mp3',
    duration: 900, // 15 minutes
    publishedAt: new Date(),
    isPlayed: false,
    playProgress: 0,
  },
];

export default function PodcastsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'discover' | 'subscribed'>('discover');

  const subscribedPodcasts = mockPodcasts.filter(p => p.isSubscribed);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderPodcastCard = ({ item }: { item: Podcast }) => (
    <TouchableOpacity
      style={styles.podcastCard}
      onPress={() => {}}
      activeOpacity={0.9}
    >
      <View style={styles.podcastImage}>
        <Text style={styles.podcastImageText}>🎙️</Text>
      </View>
      <Text style={styles.podcastTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.podcastHost} numberOfLines={1}>{item.host}</Text>
      <View style={styles.podcastMeta}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEpisode = ({ item }: { item: PodcastEpisode }) => {
    const podcast = mockPodcasts.find(p => p.id === item.podcastId);
    const progress = item.playProgress ? (item.playProgress / item.duration) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.episodeCard}
        onPress={() => navigation.navigate('PodcastPlayer', { podcastId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.episodeImage}>
          <Text style={styles.episodeImageText}>🎙️</Text>
          {item.isPlayed && (
            <View style={styles.playedBadge}>
              <Text style={styles.playedText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.episodeContent}>
          <Text style={styles.episodePodcast}>{podcast?.title}</Text>
          <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.episodeDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.episodeMeta}>
            <Text style={styles.episodeDate}>{formatDate(item.publishedAt)}</Text>
            <Text style={styles.episodeDot}>•</Text>
            <Text style={styles.episodeDuration}>{formatDuration(item.duration)}</Text>
          </View>
          {progress > 0 && progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playButtonText}>▶</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'subscribed' && styles.tabActive]}
          onPress={() => setSelectedTab('subscribed')}
        >
          <Text style={[styles.tabText, selectedTab === 'subscribed' && styles.tabTextActive]}>
            Subscribed
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'discover' ? (
        <>
          {/* Featured Podcasts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Podcasts</Text>
            <FlatList
              data={mockPodcasts}
              renderItem={renderPodcastCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.podcastList}
            />
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {['Discussion', 'Music', 'Youth', 'Prayer', 'Teaching', 'Testimony'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryCard, { backgroundColor: getCategoryColor(category) }]}
                >
                  <Text style={styles.categoryCardText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Latest Episodes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Episodes</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {mockEpisodes.map((episode) => (
              <View key={episode.id}>
                {renderEpisode({ item: episode })}
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Subscribed Podcasts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Podcasts</Text>
            {subscribedPodcasts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎙️</Text>
                <Text style={styles.emptyStateTitle}>No Subscriptions Yet</Text>
                <Text style={styles.emptyStateText}>
                  Subscribe to your favorite podcasts to see them here.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setSelectedTab('discover')}
                >
                  <Text style={styles.emptyStateButtonText}>Discover Podcasts</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={subscribedPodcasts}
                renderItem={renderPodcastCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.podcastList}
              />
            )}
          </View>

          {/* Continue Listening */}
          {subscribedPodcasts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Listening</Text>
              {mockEpisodes
                .filter(e => e.playProgress && e.playProgress > 0 && e.playProgress < e.duration)
                .map((episode) => (
                  <View key={episode.id}>
                    {renderEpisode({ item: episode })}
                  </View>
                ))}
            </View>
          )}

          {/* New Episodes */}
          {subscribedPodcasts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New Episodes</Text>
              {mockEpisodes
                .filter(e => subscribedPodcasts.some(p => p.id === e.podcastId) && !e.isPlayed)
                .map((episode) => (
                  <View key={episode.id}>
                    {renderEpisode({ item: episode })}
                  </View>
                ))}
            </View>
          )}
        </>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    Discussion: '#C41E3A',
    Music: '#8B0000',
    Youth: '#FF6B6B',
    Prayer: '#4A0080',
    Teaching: '#006400',
    Testimony: '#FF8C00',
  };
  return categoryColors[category] || colors.primary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: spacing.screenPadding,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.buttonBorderRadius,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textOnPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.label,
    color: colors.primary,
  },
  podcastList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  podcastCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  podcastImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: spacing.cardBorderRadius,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podcastImageText: {
    fontSize: 48,
  },
  podcastTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastHost: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  categoryCard: {
    width: (width - spacing.screenPadding * 2 - spacing.sm * 2) / 3,
    paddingVertical: spacing.lg,
    borderRadius: spacing.cardBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardText: {
    ...typography.label,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sm,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  episodeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  episodeImageText: {
    fontSize: 28,
  },
  playedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playedText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  episodeContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  episodePodcast: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  episodeTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  episodeDot: {
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  episodeDuration: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.playerBuffer,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  playButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.buttonBorderRadius,
  },
  emptyStateButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  bottomSpacing: {
    height: 120,
  },
});
