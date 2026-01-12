/**
 * Holy Culture Radio - Community Forum Screen
 * Discussions and community interaction
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../theme';
import { RootStackParamList, ForumPost, ForumCategory } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock categories
const mockCategories: ForumCategory[] = [
  { id: '1', name: 'General Discussion', description: 'Chat about anything', icon: '💬', postCount: 1250, color: '#C41E3A' },
  { id: '2', name: 'Prayer Requests', description: 'Share your prayer needs', icon: '🙏', postCount: 890, color: '#4A0080' },
  { id: '3', name: 'Testimonies', description: 'Share what God has done', icon: '✨', postCount: 456, color: '#FFD700' },
  { id: '4', name: 'Music Talk', description: 'Discuss Christian music', icon: '🎵', postCount: 678, color: '#1DB954' },
  { id: '5', name: 'Bible Study', description: 'Scripture discussions', icon: '📖', postCount: 543, color: '#4169E1' },
  { id: '6', name: 'New Believers', description: 'Welcome to the family', icon: '🌱', postCount: 234, color: '#32CD32' },
];

// Mock posts
const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'God answered my prayers! Had to share this testimony',
    content: 'After months of praying for a job, I finally got the call yesterday. God is so faithful! Never give up on your prayers.',
    author: {
      id: '1',
      username: 'BlessedBeliever',
      email: 'user1@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    category: mockCategories[2],
    createdAt: new Date(Date.now() - 3600000),
    likes: 145,
    replies: 32,
    views: 567,
    isPinned: false,
    isLocked: false,
    isLiked: false,
    tags: ['testimony', 'prayer', 'faith'],
  },
  {
    id: '2',
    title: 'Please pray for my family 🙏',
    content: 'Going through a difficult time right now. My mother is in the hospital and we could really use your prayers. Thank you family.',
    author: {
      id: '2',
      username: 'PrayerWarrior23',
      email: 'user2@example.com',
      createdAt: new Date(),
      isVerified: true,
      role: 'member',
    },
    category: mockCategories[1],
    createdAt: new Date(Date.now() - 7200000),
    likes: 234,
    replies: 89,
    views: 890,
    isPinned: true,
    isLocked: false,
    isLiked: true,
    tags: ['prayer', 'family', 'healing'],
  },
  {
    id: '3',
    title: 'What\'s your favorite worship song right now?',
    content: 'I\'ve been listening to "Jireh" by Elevation Worship on repeat. The lyrics are so powerful. What songs are blessing you lately?',
    author: {
      id: '3',
      username: 'WorshipLover',
      email: 'user3@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    category: mockCategories[3],
    createdAt: new Date(Date.now() - 14400000),
    likes: 78,
    replies: 56,
    views: 432,
    isPinned: false,
    isLocked: false,
    isLiked: false,
    tags: ['worship', 'music', 'discussion'],
  },
  {
    id: '4',
    title: 'New to faith - where do I start reading the Bible?',
    content: 'I just gave my life to Christ last month and I want to start reading the Bible but it feels overwhelming. Any advice for a new believer?',
    author: {
      id: '4',
      username: 'NewInChrist',
      email: 'user4@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    category: mockCategories[5],
    createdAt: new Date(Date.now() - 28800000),
    likes: 167,
    replies: 78,
    views: 654,
    isPinned: false,
    isLocked: false,
    isLiked: true,
    tags: ['new believer', 'bible', 'help'],
  },
  {
    id: '5',
    title: 'Weekly Bible Study - Book of James, Chapter 1',
    content: 'Let\'s dive into the book of James together! This week we\'re focusing on Chapter 1. What stood out to you? Share your insights below.',
    author: {
      id: '5',
      username: 'PastorMichael',
      email: 'pastor@holycultureradio.com',
      avatar: '',
      bio: 'Senior Pastor',
      createdAt: new Date(),
      isVerified: true,
      role: 'admin',
    },
    category: mockCategories[4],
    createdAt: new Date(Date.now() - 43200000),
    likes: 234,
    replies: 123,
    views: 987,
    isPinned: true,
    isLocked: false,
    isLiked: false,
    tags: ['bible study', 'james', 'weekly'],
  },
];

export default function ForumScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'feed' | 'categories'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(mockPosts);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const filteredPosts = selectedCategory
    ? posts.filter(p => p.category.id === selectedCategory)
    : posts;

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={[styles.postCard, item.isPinned && styles.pinnedPost]}
      onPress={() => navigation.navigate('ForumPost', { postId: item.id })}
      activeOpacity={0.9}
    >
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>📌 Pinned</Text>
        </View>
      )}

      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: item.category.color }]}>
        <Text style={styles.categoryBadgeText}>{item.category.icon} {item.category.name}</Text>
      </View>

      {/* Author Row */}
      <View style={styles.authorRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.author.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{item.author.username}</Text>
            {item.author.isVerified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
            {item.author.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Staff</Text>
              </View>
            )}
          </View>
          <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {item.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => toggleLike(item.id)}
        >
          <Text style={[styles.statIcon, item.isLiked && styles.statIconActive]}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.statText}>{item.likes}</Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statText}>{item.replies}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statText}>{item.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: ForumCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.categoryCardActive,
      ]}
      onPress={() => {
        setSelectedCategory(selectedCategory === item.id ? null : item.id);
        setSelectedTab('feed');
      }}
      activeOpacity={0.9}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.categoryPostCount}>{item.postCount} posts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'feed' && styles.tabActive]}
          onPress={() => setSelectedTab('feed')}
        >
          <Text style={[styles.tabText, selectedTab === 'feed' && styles.tabTextActive]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'categories' && styles.tabActive]}
          onPress={() => setSelectedTab('categories')}
        >
          <Text style={[styles.tabText, selectedTab === 'categories' && styles.tabTextActive]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter (when in feed tab) */}
      {selectedTab === 'feed' && selectedCategory && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterText}>
            Showing: {mockCategories.find(c => c.id === selectedCategory)?.name}
          </Text>
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilter}>✕ Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {selectedTab === 'feed' ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={<View style={styles.listFooter} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💬</Text>
              <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
              <Text style={styles.emptyStateText}>
                Be the first to start a discussion in this category!
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={mockCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}

      {/* Create Post FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
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
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  clearFilter: {
    ...typography.label,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.screenPadding,
  },
  postCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinnedPost: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pinnedBadge: {
    marginBottom: spacing.sm,
  },
  pinnedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  adminBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adminBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  postTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  postTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  postContent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statIconActive: {
    color: colors.primary,
  },
  statText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardActive: {
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoryDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryPostCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  listFooter: {
    height: 100,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
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
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.screenPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.textOnPrimary,
    fontWeight: '300',
  },
});
