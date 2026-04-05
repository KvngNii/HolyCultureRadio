/**
 * Holy Culture Radio - Music Screen
 * Spotify integration for streaming Christian music
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { typography, spacing, shadows } from '../theme';
import { useColors } from '../hooks/useColors';
import { spotifyService } from '../services/spotify';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.screenPadding * 2 - spacing.md) / 2;

interface SpotifyTrackData {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  preview_url: string | null;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{ id: string; name: string }>;
}

interface SpotifyPlaylistData {
  id: string;
  name: string;
  description: string;
  uri: string;
  images: Array<{ url: string }>;
  owner: { display_name: string };
  tracks: { total: number };
}

interface SpotifyAlbumData {
  id: string;
  name: string;
  uri: string;
  images: Array<{ url: string }>;
  artists: Array<{ name: string }>;
  release_date: string;
  total_tracks: number;
}

const genres = [
  { name: 'All', query: 'christian gospel worship' },
  { name: 'Gospel', query: 'gospel music' },
  { name: 'CCM', query: 'contemporary christian music' },
  { name: 'Christian Hip-Hop', query: 'christian hip hop rap' },
  { name: 'Worship', query: 'worship praise' },
  { name: 'R&B', query: 'christian r&b soul' },
];

const moods = [
  { name: 'Worship', color: '#C41E3A', emoji: '🙏', query: 'worship praise songs' },
  { name: 'Uplifting', color: '#FF8C00', emoji: '☀️', query: 'uplifting christian inspirational' },
  { name: 'Peaceful', color: '#4169E1', emoji: '🕊️', query: 'peaceful christian relaxing instrumental' },
  { name: 'Energetic', color: '#32CD32', emoji: '⚡', query: 'christian rock energetic praise' },
  { name: 'Reflective', color: '#9370DB', emoji: '💭', query: 'christian meditation contemplative' },
  { name: 'Joyful', color: '#FFD700', emoji: '😊', query: 'joyful praise celebration christian' },
];

export default function MusicScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('christian gospel worship');
  const [playlists, setPlaylists] = useState<SpotifyPlaylistData[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrackData[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbumData[]>([]);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrackData[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrackData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await spotifyService.isAuthenticated();
    setIsConnected(authenticated);
    if (authenticated) {
      loadSpotifyData();
    } else {
      setIsLoading(false);
    }
  };

  const connectToSpotify = async () => {
    try {
      setIsLoading(true);
      const success = await spotifyService.login();
      if (success) {
        setIsConnected(true);
        await loadSpotifyData();
      } else {
        Alert.alert('Connection Failed', 'Could not connect to Spotify. Please try again.');
      }
    } catch (error) {
      console.error('Spotify connect error:', error);
      Alert.alert('Error', 'An error occurred while connecting to Spotify.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpotifyData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const user = await spotifyService.getCurrentUser();
      setUserProfile(user);

      // Fetch tracks based on current query
      const searchResult = await spotifyService.searchChristianMusic(currentQuery, 20);
      if (searchResult?.tracks?.items) {
        setTracks(searchResult.tracks.items);
      }

      // Fetch featured playlists
      const featuredResult = await spotifyService.getFeaturedPlaylists(10);
      if (featuredResult?.playlists?.items) {
        setPlaylists(featuredResult.playlists.items);
      }

      // Fetch new releases (albums)
      const releasesResult = await spotifyService.getNewReleases(10);
      if (releasesResult?.albums?.items) {
        setAlbums(releasesResult.albums.items);
      }

      // Fetch recently played
      const recentResult = await spotifyService.getRecentlyPlayed(10);
      if (recentResult?.items) {
        setRecentTracks(recentResult.items.map((item: any) => item.track));
      }

      // Get current playback
      const playbackState = await spotifyService.getPlaybackState();
      if (playbackState?.item) {
        setCurrentlyPlaying(playbackState.item);
      }
    } catch (error) {
      console.error('Error loading Spotify data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuery]);

  // Reload when query changes
  useEffect(() => {
    if (isConnected) {
      loadSpotifyData();
    }
  }, [currentQuery, isConnected, loadSpotifyData]);

  // Handle genre selection
  const handleGenreSelect = (genre: typeof genres[0]) => {
    setSelectedGenre(genre.name);
    setSelectedMood(null);
    setCurrentQuery(genre.query);
  };

  // Handle mood selection
  const handleMoodSelect = (mood: typeof moods[0]) => {
    setSelectedMood(mood.name);
    setSelectedGenre(''); // Clear genre selection
    setCurrentQuery(mood.query);
  };

  const disconnectSpotify = async () => {
    Alert.alert(
      'Disconnect Spotify',
      'Are you sure you want to disconnect your Spotify account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await spotifyService.disconnect();
            setIsConnected(false);
            setPlaylists([]);
            setTracks([]);
            setAlbums([]);
            setRecentTracks([]);
            setUserProfile(null);
          },
        },
      ]
    );
  };

  const playTrack = async (track: SpotifyTrackData) => {
    try {
      // Try to play via Spotify Connect
      await spotifyService.play(track.uri);
      setCurrentlyPlaying(track);
    } catch (error) {
      // If no active device, try preview URL or open Spotify
      if (track.preview_url) {
        Alert.alert(
          'Play Preview',
          'No active Spotify device found. Would you like to play a 30-second preview or open in Spotify?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Spotify', onPress: () => Linking.openURL(track.uri) },
          ]
        );
      } else {
        Alert.alert(
          'Open in Spotify',
          'Open this track in the Spotify app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open', onPress: () => Linking.openURL(track.uri) },
          ]
        );
      }
    }
  };

  const openPlaylist = (playlist: SpotifyPlaylistData) => {
    Linking.openURL(playlist.uri);
  };

  const openAlbum = (album: SpotifyAlbumData) => {
    Linking.openURL(album.uri);
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getImageUrl = (images: Array<{ url: string }> | undefined, size = 0): string | null => {
    if (!images || images.length === 0) return null;
    return images[size]?.url || images[0]?.url || null;
  };

  const renderPlaylistCard = ({ item }: { item: SpotifyPlaylistData }) => {
    const imageUrl = getImageUrl(item.images);
    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() => openPlaylist(item)}
        activeOpacity={0.9}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.playlistImage} />
        ) : (
          <View style={[styles.playlistImage, styles.placeholderImage]}>
            <Text style={styles.playlistImageText}>🎵</Text>
          </View>
        )}
        <Text style={styles.playlistName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.playlistInfo}>{item.tracks?.total || 0} songs</Text>
      </TouchableOpacity>
    );
  };

  const renderAlbumCard = ({ item }: { item: SpotifyAlbumData }) => {
    const imageUrl = getImageUrl(item.images);
    return (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={() => openAlbum(item)}
        activeOpacity={0.9}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.albumImage} />
        ) : (
          <View style={[styles.albumImage, styles.placeholderImage]}>
            <Text style={styles.albumImageText}>💿</Text>
          </View>
        )}
        <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {item.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTrackItem = (track: SpotifyTrackData, index: number) => {
    const imageUrl = getImageUrl(track.album?.images, 2);
    const isPlaying = currentlyPlaying?.id === track.id;

    return (
      <TouchableOpacity
        key={track.id}
        style={[styles.trackItem, isPlaying && styles.trackItemPlaying]}
        onPress={() => playTrack(track)}
        activeOpacity={0.8}
      >
        <Text style={[styles.trackNumber, isPlaying && styles.trackNumberPlaying]}>
          {isPlaying ? '▶' : index + 1}
        </Text>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.trackImage} />
        ) : (
          <View style={[styles.trackImage, styles.placeholderImage]}>
            <Text style={styles.trackImageText}>🎵</Text>
          </View>
        )}
        <View style={styles.trackInfo}>
          <Text style={[styles.trackName, isPlaying && styles.trackNamePlaying]} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
          </Text>
        </View>
        <Text style={styles.trackDuration}>{formatDuration(track.duration_ms)}</Text>
      </TouchableOpacity>
    );
  };

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
            <TouchableOpacity
              style={styles.connectButton}
              onPress={connectToSpotify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Spotify</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.premiumNote}>
              * Spotify Premium required for full playback
            </Text>
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

  if (isLoading && tracks.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading music...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Connected Header */}
      <View style={styles.connectedHeader}>
        <View style={styles.spotifyBadge}>
          <Text style={styles.spotifyBadgeIcon}>♪</Text>
          <Text style={styles.spotifyBadgeText}>
            {userProfile?.display_name ? `Hi, ${userProfile.display_name}` : 'Connected to Spotify'}
          </Text>
        </View>
        <TouchableOpacity onPress={disconnectSpotify}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Currently Playing */}
      {currentlyPlaying && (
        <View style={styles.nowPlayingBanner}>
          {getImageUrl(currentlyPlaying.album?.images, 2) ? (
            <Image
              source={{ uri: getImageUrl(currentlyPlaying.album?.images, 2)! }}
              style={styles.nowPlayingImage}
            />
          ) : (
            <View style={[styles.nowPlayingImage, styles.placeholderImage]}>
              <Text>🎵</Text>
            </View>
          )}
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>
              {currentlyPlaying.name}
            </Text>
            <Text style={styles.nowPlayingArtist} numberOfLines={1}>
              {currentlyPlaying.artists?.map(a => a.name).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Genre Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genreContainer}
        contentContainerStyle={styles.genreContent}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.name}
            style={[
              styles.genrePill,
              selectedGenre === genre.name && styles.genrePillActive,
            ]}
            onPress={() => handleGenreSelect(genre)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenre === genre.name && styles.genreTextActive,
              ]}
            >
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Playlists */}
      {playlists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Playlists</Text>
          </View>
          <FlatList
            data={playlists}
            renderItem={renderPlaylistCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Christian Music */}
      {tracks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedMood ? `${selectedMood} Music` : (selectedGenre === 'All' ? 'Christian Music' : selectedGenre)}
            </Text>
          </View>
          {tracks.slice(0, 10).map((track, index) => renderTrackItem(track, index))}
        </View>
      )}

      {/* New Releases */}
      {albums.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
          </View>
          <FlatList
            data={albums}
            renderItem={renderAlbumCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Browse by Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Mood</Text>
        <View style={styles.moodGrid}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.name}
              style={[
                styles.moodCard,
                { backgroundColor: mood.color },
                selectedMood === mood.name && styles.moodCardActive,
              ]}
              onPress={() => handleMoodSelect(mood)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodName}>{mood.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <View style={styles.recentlyPlayedGrid}>
            {recentTracks.slice(0, 4).map((track) => {
              const imageUrl = getImageUrl(track.album?.images, 2);
              return (
                <TouchableOpacity
                  key={track.id}
                  style={styles.recentlyPlayedItem}
                  onPress={() => playTrack(track)}
                  activeOpacity={0.8}
                >
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.recentlyPlayedImage} />
                  ) : (
                    <View style={[styles.recentlyPlayedImage, styles.placeholderImage]}>
                      <Text style={styles.recentlyPlayedImageText}>🎵</Text>
                    </View>
                  )}
                  <Text style={styles.recentlyPlayedName} numberOfLines={1}>
                    {track.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  placeholderImage: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.cardBorderRadius,
  },
  nowPlayingImage: {
    width: 50,
    height: 50,
    borderRadius: spacing.sm,
    marginRight: spacing.md,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabel: {
    ...typography.labelSmall,
    color: colors.textOnPrimary,
    opacity: 0.8,
    letterSpacing: 1,
  },
  nowPlayingTitle: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  nowPlayingArtist: {
    ...typography.caption,
    color: colors.textOnPrimary,
    opacity: 0.9,
  },
  trackItemPlaying: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  trackNumberPlaying: {
    color: colors.primary,
    fontWeight: '700',
  },
  trackNamePlaying: {
    color: colors.primary,
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
    marginBottom: spacing.sm,
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
  moodCardActive: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
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
