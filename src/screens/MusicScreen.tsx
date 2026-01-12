/**
 * Holy Culture Radio - Music Screen
 * Spotify integration for streaming Christian music
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
  Alert,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';
import { SpotifyPlaylist, SpotifyTrack, SpotifyAlbum } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.screenPadding * 2 - spacing.md) / 2;

// Mock Spotify data
const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: '1',
    name: 'Holy Culture Hits',
    description: 'The best Christian Hip-Hop and Gospel tracks',
    imageUrl: '',
    trackCount: 50,
    owner: 'Holy Culture Radio',
    uri: 'spotify:playlist:1',
  },
  {
    id: '2',
    name: 'Worship Essentials',
    description: 'Uplifting worship songs for your daily devotion',
    imageUrl: '',
    trackCount: 75,
    owner: 'Holy Culture Radio',
    uri: 'spotify:playlist:2',
  },
  {
    id: '3',
    name: 'Gospel Classics',
    description: 'Timeless gospel favorites',
    imageUrl: '',
    trackCount: 40,
    owner: 'Holy Culture Radio',
    uri: 'spotify:playlist:3',
  },
  {
    id: '4',
    name: 'New Christian Music',
    description: 'Fresh releases from your favorite artists',
    imageUrl: '',
    trackCount: 30,
    owner: 'Holy Culture Radio',
    uri: 'spotify:playlist:4',
  },
];

const mockTracks: SpotifyTrack[] = [
  {
    id: '1',
    name: 'Way Maker',
    artist: 'Sinach',
    album: 'Way Maker',
    albumArt: '',
    duration: 284000,
    uri: 'spotify:track:1',
  },
  {
    id: '2',
    name: 'Jireh',
    artist: 'Elevation Worship',
    album: 'Lion',
    albumArt: '',
    duration: 326000,
    uri: 'spotify:track:2',
  },
  {
    id: '3',
    name: 'Graves Into Gardens',
    artist: 'Elevation Worship',
    album: 'Graves Into Gardens',
    albumArt: '',
    duration: 362000,
    uri: 'spotify:track:3',
  },
  {
    id: '4',
    name: 'Blessing',
    artist: 'Lecrae',
    album: 'Restoration',
    albumArt: '',
    duration: 245000,
    uri: 'spotify:track:4',
  },
  {
    id: '5',
    name: 'The Goodness',
    artist: 'TobyMac',
    album: 'Life After Death',
    albumArt: '',
    duration: 198000,
    uri: 'spotify:track:5',
  },
];

const mockAlbums: SpotifyAlbum[] = [
  {
    id: '1',
    name: 'Restoration',
    artist: 'Lecrae',
    imageUrl: '',
    releaseDate: '2020',
    trackCount: 12,
    uri: 'spotify:album:1',
  },
  {
    id: '2',
    name: 'Lion',
    artist: 'Elevation Worship',
    imageUrl: '',
    releaseDate: '2022',
    trackCount: 13,
    uri: 'spotify:album:2',
  },
  {
    id: '3',
    name: 'Church Volume Two',
    artist: 'Maverick City Music',
    imageUrl: '',
    releaseDate: '2022',
    trackCount: 17,
    uri: 'spotify:album:3',
  },
];

const genres = ['All', 'Gospel', 'CCM', 'Christian Hip-Hop', 'Worship', 'R&B'];

export default function MusicScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const connectToSpotify = () => {
    // In production, this would trigger Spotify OAuth flow
    Alert.alert(
      'Connect to Spotify',
      'To stream music, you need to connect your Spotify account. You\'ll need a Spotify Premium subscription for full playback.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => setIsConnected(true) },
      ]
    );
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderPlaylistCard = ({ item }: { item: SpotifyPlaylist }) => (
    <TouchableOpacity
      style={styles.playlistCard}
      onPress={() => {
        if (!isConnected) {
          connectToSpotify();
        }
      }}
      activeOpacity={0.9}
    >
      <View style={styles.playlistImage}>
        <Text style={styles.playlistImageText}>🎵</Text>
      </View>
      <Text style={styles.playlistName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.playlistInfo}>{item.trackCount} songs</Text>
    </TouchableOpacity>
  );

  const renderAlbumCard = ({ item }: { item: SpotifyAlbum }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => {
        if (!isConnected) {
          connectToSpotify();
        }
      }}
      activeOpacity={0.9}
    >
      <View style={styles.albumImage}>
        <Text style={styles.albumImageText}>💿</Text>
      </View>
      <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Connect Banner */}
          <View style={styles.connectBanner}>
            <View style={styles.spotifyLogo}>
              <Text style={styles.spotifyLogoText}>♪</Text>
            </View>
            <Text style={styles.connectTitle}>Stream with Spotify</Text>
            <Text style={styles.connectDescription}>
              Connect your Spotify account to stream millions of Christian songs,
              albums, and curated playlists right here in the Holy Culture app.
            </Text>
            <TouchableOpacity style={styles.connectButton} onPress={connectToSpotify}>
              <Text style={styles.connectButtonText}>Connect Spotify</Text>
            </TouchableOpacity>
            <Text style={styles.premiumNote}>
              * Spotify Premium required for full playback
            </Text>
          </View>

          {/* Featured Playlists Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Holy Culture Playlists</Text>
            <FlatList
              data={mockPlaylists.slice(0, 2)}
              renderItem={renderPlaylistCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎧</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Curated Playlists</Text>
                <Text style={styles.featureDescription}>
                  Playlists curated by Holy Culture Radio DJs
                </Text>
              </View>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎵</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Millions of Songs</Text>
                <Text style={styles.featureDescription}>
                  Access Spotify's entire Christian music library
                </Text>
              </View>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Seamless Integration</Text>
                <Text style={styles.featureDescription}>
                  Control playback without leaving the app
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Connected Header */}
      <View style={styles.connectedHeader}>
        <View style={styles.spotifyBadge}>
          <Text style={styles.spotifyBadgeIcon}>♪</Text>
          <Text style={styles.spotifyBadgeText}>Connected to Spotify</Text>
        </View>
        <TouchableOpacity onPress={() => setIsConnected(false)}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Genre Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genreContainer}
        contentContainerStyle={styles.genreContent}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genrePill,
              selectedGenre === genre && styles.genrePillActive,
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenre === genre && styles.genreTextActive,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Holy Culture Playlists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Holy Culture Playlists</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockPlaylists}
          renderItem={renderPlaylistCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Trending Songs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {mockTracks.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            style={styles.trackItem}
            activeOpacity={0.8}
          >
            <Text style={styles.trackNumber}>{index + 1}</Text>
            <View style={styles.trackImage}>
              <Text style={styles.trackImageText}>🎵</Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
            </View>
            <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
            <TouchableOpacity style={styles.trackMore}>
              <Text style={styles.trackMoreText}>⋯</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* New Releases */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Releases</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockAlbums}
          renderItem={renderAlbumCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Browse by Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Mood</Text>
        <View style={styles.moodGrid}>
          {[
            { name: 'Worship', color: '#C41E3A', emoji: '🙏' },
            { name: 'Uplifting', color: '#FF8C00', emoji: '☀️' },
            { name: 'Peaceful', color: '#4169E1', emoji: '🕊️' },
            { name: 'Energetic', color: '#32CD32', emoji: '⚡' },
            { name: 'Reflective', color: '#9370DB', emoji: '💭' },
            { name: 'Joyful', color: '#FFD700', emoji: '😊' },
          ].map((mood) => (
            <TouchableOpacity
              key={mood.name}
              style={[styles.moodCard, { backgroundColor: mood.color }]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodName}>{mood.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recently Played */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <View style={styles.recentlyPlayedGrid}>
          {mockTracks.slice(0, 4).map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.recentlyPlayedItem}
              activeOpacity={0.8}
            >
              <View style={styles.recentlyPlayedImage}>
                <Text style={styles.recentlyPlayedImageText}>🎵</Text>
              </View>
              <Text style={styles.recentlyPlayedName} numberOfLines={1}>
                {track.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  connectBanner: {
    margin: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotifyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954', // Spotify green
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  spotifyLogoText: {
    fontSize: 36,
    color: colors.textOnPrimary,
  },
  connectTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  connectDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: '#1DB954',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 25,
    marginBottom: spacing.md,
  },
  connectButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  premiumNote: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
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
  horizontalList: {
    paddingHorizontal: spacing.screenPadding,
  },
  playlistCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  playlistImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: spacing.cardBorderRadius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  playlistImageText: {
    fontSize: 48,
  },
  playlistName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  playlistInfo: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  albumCard: {
    width: 140,
    marginRight: spacing.md,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  albumImageText: {
    fontSize: 40,
  },
  albumName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  albumArtist: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featuresSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  featureCard: {
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
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  spotifyBadgeIcon: {
    fontSize: 14,
    color: colors.textOnPrimary,
    marginRight: spacing.xs,
  },
  spotifyBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  disconnectText: {
    ...typography.label,
    color: colors.textMuted,
  },
  genreContainer: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  genreContent: {
    paddingHorizontal: spacing.screenPadding,
  },
  genrePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genrePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  genreTextActive: {
    color: colors.textOnPrimary,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  trackNumber: {
    ...typography.body,
    color: colors.textMuted,
    width: 24,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  trackImageText: {
    fontSize: 20,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  trackArtist: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackDuration: {
    ...typography.caption,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  trackMore: {
    padding: spacing.xs,
  },
  trackMoreText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  moodCard: {
    width: (width - spacing.screenPadding * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: spacing.cardBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  moodName: {
    ...typography.label,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  recentlyPlayedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  recentlyPlayedItem: {
    width: (width - spacing.screenPadding * 2 - spacing.sm) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  recentlyPlayedImage: {
    width: 56,
    height: 56,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentlyPlayedImageText: {
    fontSize: 24,
  },
  recentlyPlayedName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  bottomSpacing: {
    height: 120,
  },
});
