/**
 * Holy Culture Radio - Devotionals Screen
 * Daily devotionals from community members
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { typography, spacing } from '../theme';
import { useColors } from '../hooks/useColors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList, Devotional } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories = ['All', 'Peace', 'Faith', 'Love', 'Hope', 'Prayer', 'Worship', 'Gratitude', 'Strength'];

export default function DevotionalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);

  const fetchDevotionals = useCallback(async () => {
    try {
      let query = supabase
        .from('devotionals')
        .select(`
          id,
          title,
          content,
          scripture,
          scripture_reference,
          tags,
          likes_count,
          comments_count,
          created_at,
          author:profiles!author_id (
            id,
            username,
            email,
            avatar_url,
            bio,
            is_verified,
            role,
            created_at
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      // Filter by category/tag if not "All"
      if (selectedCategory !== 'All') {
        query = query.contains('tags', [selectedCategory.toLowerCase()]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Devotional type
      const transformedData: Devotional[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        scripture: item.scripture,
        scriptureReference: item.scripture_reference,
        tags: item.tags || [],
        likes: item.likes_count || 0,
        comments: item.comments_count || 0,
        createdAt: new Date(item.created_at),
        isLiked: false, // TODO: Check user's likes
        isSaved: false, // TODO: Check user's saves
        author: item.author ? {
          id: item.author.id,
          username: item.author.username,
          email: item.author.email,
          avatar: item.author.avatar_url || '',
          bio: item.author.bio || '',
          isVerified: item.author.is_verified || false,
          role: item.author.role || 'member',
          createdAt: new Date(item.author.created_at),
        } : {
          id: 'unknown',
          username: 'Anonymous',
          email: '',
          avatar: '',
          bio: '',
          isVerified: false,
          role: 'member',
          createdAt: new Date(),
        },
      }));

      setDevotionals(transformedData);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  // Fetch on mount and when category changes
  useEffect(() => {
    setLoading(true);
    fetchDevotionals();
  }, [fetchDevotionals]);

  // Refresh when screen comes into focus (e.g., after submitting a new devotional)
  useFocusEffect(
    useCallback(() => {
      fetchDevotionals();
    }, [fetchDevotionals])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevotionals();
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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyTitle}>No Devotionals Yet</Text>
      <Text style={styles.emptyText}>
        {selectedCategory === 'All'
          ? 'Be the first to share a devotional with the community!'
          : `No devotionals found with the "${selectedCategory}" tag.`}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('CreateDevotional')}
      >
        <Text style={styles.emptyButtonText}>Write a Devotional</Text>
      </TouchableOpacity>
    </View>
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

      {/* Loading State */}
      {loading && devotionals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading devotionals...</Text>
        </View>
      ) : (
        /* Devotionals List */
        <FlatList
          data={devotionals}
          renderItem={renderDevotional}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            devotionals.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={devotionals.length > 0 ? <View style={styles.listFooter} /> : null}
        />
      )}

      {/* Submit Devotional FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateDevotional')}
      >
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoriesContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 70,
  },
  categoriesContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textOnPrimary,
  },
  listContent: {
    padding: spacing.screenPadding,
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '600',
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

