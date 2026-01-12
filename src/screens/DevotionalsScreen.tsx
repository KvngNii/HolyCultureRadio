/**
 * Holy Culture Radio - Devotionals Screen
 * Daily devotionals from community members
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../theme';
import { RootStackParamList, Devotional } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock devotionals data
const mockDevotionals: Devotional[] = [
  {
    id: '1',
    title: 'Finding Peace in the Storm',
    content: 'In times of trouble, we often forget that God is our refuge and strength. Today\'s devotional reminds us that even in the midst of life\'s storms, we can find peace in His presence.',
    scripture: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
    scriptureReference: 'Psalm 46:10',
    author: {
      id: '1',
      username: 'PastorMichael',
      email: 'pastor@holycultureradio.com',
      avatar: '',
      bio: 'Senior Pastor',
      createdAt: new Date(),
      isVerified: true,
      role: 'admin',
    },
    createdAt: new Date(),
    likes: 245,
    comments: 32,
    isLiked: false,
    isSaved: false,
    tags: ['peace', 'faith', 'trust'],
  },
  {
    id: '2',
    title: 'Walking in Faith',
    content: 'Faith is not about seeing the whole staircase, but taking the first step. Abraham didn\'t know where he was going, but he trusted God\'s guidance.',
    scripture: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    scriptureReference: 'Hebrews 11:1',
    author: {
      id: '2',
      username: 'SisterGrace',
      email: 'grace@holycultureradio.com',
      avatar: '',
      bio: 'Worship Leader',
      createdAt: new Date(),
      isVerified: true,
      role: 'moderator',
    },
    createdAt: new Date(Date.now() - 86400000),
    likes: 189,
    comments: 24,
    isLiked: true,
    isSaved: true,
    tags: ['faith', 'trust', 'journey'],
  },
  {
    id: '3',
    title: 'The Power of Gratitude',
    content: 'A grateful heart is a magnet for miracles. When we focus on what we have instead of what we lack, we open ourselves to God\'s abundant blessings.',
    scripture: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
    scriptureReference: '1 Thessalonians 5:18',
    author: {
      id: '3',
      username: 'BrotherDavid',
      email: 'david@holycultureradio.com',
      avatar: '',
      bio: 'Community Member',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    createdAt: new Date(Date.now() - 172800000),
    likes: 156,
    comments: 18,
    isLiked: false,
    isSaved: false,
    tags: ['gratitude', 'blessings', 'thanksgiving'],
  },
  {
    id: '4',
    title: 'Strength in Weakness',
    content: 'Our weaknesses are opportunities for God\'s strength to shine through. When we acknowledge our limitations, we make room for His power.',
    scripture: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness."',
    scriptureReference: '2 Corinthians 12:9',
    author: {
      id: '1',
      username: 'PastorMichael',
      email: 'pastor@holycultureradio.com',
      avatar: '',
      bio: 'Senior Pastor',
      createdAt: new Date(),
      isVerified: true,
      role: 'admin',
    },
    createdAt: new Date(Date.now() - 259200000),
    likes: 312,
    comments: 45,
    isLiked: true,
    isSaved: false,
    tags: ['strength', 'grace', 'weakness'],
  },
];

const categories = ['All', 'Peace', 'Faith', 'Love', 'Hope', 'Prayer', 'Worship'];

export default function DevotionalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [devotionals, setDevotionals] = useState(mockDevotionals);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const toggleLike = (id: string) => {
    setDevotionals(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, isLiked: !d.isLiked, likes: d.isLiked ? d.likes - 1 : d.likes + 1 }
          : d
      )
    );
  };

  const toggleSave = (id: string) => {
    setDevotionals(prev =>
      prev.map(d =>
        d.id === id ? { ...d, isSaved: !d.isSaved } : d
      )
    );
  };

  const renderDevotional = ({ item }: { item: Devotional }) => (
    <TouchableOpacity
      style={styles.devotionalCard}
      onPress={() => navigation.navigate('DevotionalDetail', { devotionalId: item.id })}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.author.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.author.username}</Text>
              {item.author.isVerified && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleSave(item.id)}>
          <Text style={[styles.saveIcon, item.isSaved && styles.saveIconActive]}>
            {item.isSaved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.devotionalTitle}>{item.title}</Text>
      <Text style={styles.devotionalContent} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Scripture */}
      <View style={styles.scriptureBox}>
        <Text style={styles.scriptureText}>"{item.scripture}"</Text>
        <Text style={styles.scriptureReference}>{item.scriptureReference}</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.footerAction}
          onPress={() => toggleLike(item.id)}
        >
          <Text style={[styles.actionIcon, item.isLiked && styles.actionIconActive]}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill,
              selectedCategory === category && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Devotionals List */}
      <FlatList
        data={devotionals}
        renderItem={renderDevotional}
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
      />

      {/* Submit Devotional FAB */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>✍️</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoriesContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textOnPrimary,
  },
  listContent: {
    padding: spacing.screenPadding,
  },
  devotionalCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '700',
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  saveIcon: {
    fontSize: 24,
    color: colors.textMuted,
  },
  saveIconActive: {
    color: colors.accent,
  },
  devotionalTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  devotionalContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  scriptureBox: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  scriptureText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  scriptureReference: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  actionIconActive: {
    color: colors.primary,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listFooter: {
    height: 100,
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
    fontSize: 24,
  },
});
