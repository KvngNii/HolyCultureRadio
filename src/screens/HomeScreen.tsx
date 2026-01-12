/**
 * Holy Culture Radio - Home Screen
 * Main dashboard with quick access to all features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, shadows } from '../theme';
import { RootStackParamList, BottomTabParamList } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.screenPadding * 2 - spacing.md) / 2;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for featured content
const featuredDevotional = {
  id: '1',
  title: 'Finding Peace in the Storm',
  author: 'Pastor Michael',
  imageUrl: null,
};

const recentPodcasts = [
  { id: '1', title: 'Faith & Culture Today', episode: 'Ep. 45' },
  { id: '2', title: 'Gospel Music Hour', episode: 'Ep. 120' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section - Live Radio */}
      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => navigation.navigate('Main', { screen: 'Radio' } as any)}
        activeOpacity={0.9}
      >
        <View style={styles.heroGradient}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE NOW</Text>
          </View>
          <Text style={styles.heroTitle}>Holy Culture Radio</Text>
          <Text style={styles.heroSubtitle}>SiriusXM Channel 154</Text>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Listen Live</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Access Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard
            title="Devotionals"
            subtitle="Daily inspiration"
            icon="📖"
            onPress={() => navigation.navigate('Main', { screen: 'Devotionals' } as any)}
          />
          <QuickAccessCard
            title="Podcasts"
            subtitle="Latest episodes"
            icon="🎙️"
            onPress={() => navigation.navigate('Main', { screen: 'Podcasts' } as any)}
          />
          <QuickAccessCard
            title="Music"
            subtitle="Stream via Spotify"
            icon="🎵"
            onPress={() => navigation.navigate('Main', { screen: 'Music' } as any)}
          />
          <QuickAccessCard
            title="Community"
            subtitle="Join the discussion"
            icon="💬"
            onPress={() => navigation.navigate('Main', { screen: 'Forum' } as any)}
          />
        </View>
      </View>

      {/* Featured Devotional */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Devotional</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Devotionals' } as any)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => navigation.navigate('DevotionalDetail', { devotionalId: featuredDevotional.id })}
          activeOpacity={0.9}
        >
          <View style={styles.featuredImagePlaceholder}>
            <Text style={styles.featuredImageText}>HC</Text>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{featuredDevotional.title}</Text>
            <Text style={styles.featuredAuthor}>by {featuredDevotional.author}</Text>
            <View style={styles.readButton}>
              <Text style={styles.readButtonText}>Read Now</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Podcasts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Podcasts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Podcasts' } as any)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentPodcasts.map((podcast) => (
          <TouchableOpacity
            key={podcast.id}
            style={styles.podcastItem}
            onPress={() => navigation.navigate('PodcastPlayer', { podcastId: podcast.id })}
            activeOpacity={0.8}
          >
            <View style={styles.podcastImage}>
              <Text style={styles.podcastImageText}>🎙️</Text>
            </View>
            <View style={styles.podcastInfo}>
              <Text style={styles.podcastTitle}>{podcast.title}</Text>
              <Text style={styles.podcastEpisode}>{podcast.episode}</Text>
            </View>
            <View style={styles.playIconSmall}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Community Highlight */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Highlights</Text>
        <TouchableOpacity
          style={styles.communityCard}
          onPress={() => navigation.navigate('Main', { screen: 'Forum' } as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.communityTitle}>Join the Conversation</Text>
          <Text style={styles.communitySubtitle}>
            Connect with fellow believers, share testimonies, and grow together in faith.
          </Text>
          <View style={styles.communityStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.5K+</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Discussions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Daily Posts</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

function QuickAccessCard({ title, subtitle, icon, onPress }: QuickAccessCardProps) {
  return (
    <TouchableOpacity style={styles.quickAccessCard} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.quickAccessIcon}>{icon}</Text>
      <Text style={styles.quickAccessTitle}>{title}</Text>
      <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroCard: {
    margin: spacing.screenPadding,
    borderRadius: spacing.cardBorderRadius,
    overflow: 'hidden',
    ...shadows.large,
  },
  heroGradient: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: spacing.sm,
  },
  liveText: {
    ...typography.labelSmall,
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
  },
  heroButton: {
    backgroundColor: colors.textOnPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.buttonBorderRadius,
  },
  heroButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAccessCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAccessIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  quickAccessTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quickAccessSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featuredCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredImagePlaceholder: {
    height: 150,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageText: {
    ...typography.h1,
    color: colors.textOnPrimary,
    opacity: 0.5,
  },
  featuredContent: {
    padding: spacing.md,
  },
  featuredTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featuredAuthor: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  readButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.buttonBorderRadius,
    alignSelf: 'flex-start',
  },
  readButtonText: {
    ...typography.buttonSmall,
    color: colors.textOnPrimary,
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podcastImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastImageText: {
    fontSize: 24,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  podcastTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  podcastEpisode: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    marginLeft: 2,
  },
  communityCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  communityTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  communitySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h4,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});
