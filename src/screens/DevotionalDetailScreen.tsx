/**
 * Holy Culture Radio - Devotional Detail Screen
 * Full devotional view with comments
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { typography, spacing } from '../theme';
import { useColors } from '../hooks/useColors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList, DevotionalComment, Devotional } from '../types';

type DevotionalDetailRouteProp = RouteProp<RootStackParamList, 'DevotionalDetail'>;

export default function DevotionalDetailScreen() {
  const route = useRoute<DevotionalDetailRouteProp>();
  const { devotionalId } = route.params;
  const colors = useColors();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<DevotionalComment[]>([]);

  const fetchDevotional = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch devotional with author info
      const { data, error: fetchError } = await supabase
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
        .eq('id', devotionalId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const transformedDevotional: Devotional = {
          id: data.id,
          title: data.title,
          content: data.content,
          scripture: data.scripture,
          scriptureReference: data.scripture_reference,
          tags: data.tags || [],
          likes: data.likes_count || 0,
          comments: data.comments_count || 0,
          createdAt: new Date(data.created_at),
          isLiked: false,
          isSaved: false,
          author: data.author ? {
            id: data.author.id,
            username: data.author.username,
            email: data.author.email,
            avatar: data.author.avatar_url || '',
            bio: data.author.bio || '',
            isVerified: data.author.is_verified || false,
            role: data.author.role || 'member',
            createdAt: new Date(data.author.created_at),
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
        };

        setDevotional(transformedDevotional);
        setLikes(transformedDevotional.likes);
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('devotional_comments')
        .select(`
          id,
          content,
          likes_count,
          created_at,
          author:profiles!author_id (
            id,
            username,
            email,
            avatar_url,
            is_verified,
            role,
            created_at
          )
        `)
        .eq('devotional_id', devotionalId)
        .order('created_at', { ascending: false });

      if (commentsData) {
        const transformedComments: DevotionalComment[] = commentsData.map((c: any) => ({
          id: c.id,
          devotionalId: devotionalId,
          content: c.content,
          likes: c.likes_count || 0,
          createdAt: new Date(c.created_at),
          author: c.author ? {
            id: c.author.id,
            username: c.author.username,
            email: c.author.email,
            avatar: c.author.avatar_url || '',
            isVerified: c.author.is_verified || false,
            role: c.author.role || 'member',
            createdAt: new Date(c.author.created_at),
          } : {
            id: 'unknown',
            username: 'Anonymous',
            email: '',
            avatar: '',
            isVerified: false,
            role: 'member',
            createdAt: new Date(),
          },
        }));
        setComments(transformedComments);
      }

    } catch (err: any) {
      console.error('Error fetching devotional:', err);
      setError(err.message || 'Failed to load devotional');
    } finally {
      setLoading(false);
    }
  }, [devotionalId]);

  useEffect(() => {
    fetchDevotional();
  }, [fetchDevotional]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Update likes in Supabase
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Update saves in Supabase
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('devotional_comments')
        .insert({
          devotional_id: devotionalId,
          author_id: user.id,
          content: commentText.trim(),
        })
        .select(`
          id,
          content,
          likes_count,
          created_at
        `)
        .single();

      if (error) throw error;

      // Add the new comment to the list
      const newComment: DevotionalComment = {
        id: data.id,
        devotionalId: devotionalId,
        author: {
          id: user.id,
          username: user.email?.split('@')[0] || 'You',
          email: user.email || '',
          avatar: '',
          isVerified: false,
          role: 'member',
          createdAt: new Date(),
        },
        content: data.content,
        createdAt: new Date(data.created_at),
        likes: 0,
      };

      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading devotional...</Text>
      </View>
    );
  }

  if (error || !devotional) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorTitle}>Could not load devotional</Text>
        <Text style={styles.errorText}>{error || 'Devotional not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDevotional}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View style={styles.authorSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {devotional.author.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{devotional.author.username}</Text>
              {devotional.author.isVerified && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            <Text style={styles.authorBio} numberOfLines={2}>
              {devotional.author.bio || 'Community Member'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{devotional.title}</Text>
        <Text style={styles.date}>
          {devotional.createdAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Scripture */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>"{devotional.scripture}"</Text>
          <Text style={styles.scriptureReference}>{devotional.scriptureReference}</Text>
        </View>

        {/* Content */}
        <Text style={styles.content}>{devotional.content}</Text>

        {/* Tags */}
        {devotional.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {devotional.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={[styles.actionIcon, isSaved && styles.saveIconActive]}>
              {isSaved ? '★' : '☆'}
            </Text>
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

          {comments.length === 0 ? (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first to share your thoughts!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.author.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={styles.commentAuthor}>{comment.author.username}</Text>
                      {comment.author.isVerified && (
                        <Text style={styles.verifiedBadge}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.commentTime}>
                      {formatTimeAgo(comment.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity style={styles.commentLike}>
                  <Text style={styles.commentLikeIcon}>🤍</Text>
                  <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screenPadding,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h4,
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
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '700',
  },
  authorBio: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  scriptureBox: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  scriptureText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  scriptureReference: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.screenPadding,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.screenPadding,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  actionIconActive: {
    color: colors.primary,
  },
  actionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  saveIconActive: {
    color: colors.accent,
  },
  prayerSection: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  prayerTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  prayerText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  commentsSection: {
    paddingHorizontal: spacing.screenPadding,
  },
  commentsTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  noComments: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.lg,
    alignItems: 'center',
  },
  noCommentsText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  commentAvatarText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  commentContent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  commentLikeCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bottomSpacing: {
    height: 100,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  sendButtonText: {
    ...typography.buttonSmall,
    color: colors.textOnPrimary,
  },
});
