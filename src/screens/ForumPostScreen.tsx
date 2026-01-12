/**
 * Holy Culture Radio - Forum Post Detail Screen
 * View and reply to forum posts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { RootStackParamList, ForumReply } from '../types';

type ForumPostRouteProp = RouteProp<RootStackParamList, 'ForumPost'>;

// Mock post data
const mockPost = {
  id: '2',
  title: 'Please pray for my family 🙏',
  content: `Going through a difficult time right now. My mother is in the hospital and we could really use your prayers. Thank you family.

She was diagnosed with a serious condition last week and the doctors say she needs surgery. We're trusting God through this process but it's been hard.

I know that with this community's prayers, we can get through this. Thank you all for your support and love. It means more than you know.

"The prayer of a righteous person is powerful and effective." - James 5:16`,
  author: {
    id: '2',
    username: 'PrayerWarrior23',
    email: 'user2@example.com',
    bio: 'Believer in Christ | Prayer warrior | Mom of 3',
    createdAt: new Date(),
    isVerified: true,
    role: 'member' as const,
  },
  category: {
    id: '2',
    name: 'Prayer Requests',
    description: 'Share your prayer needs',
    icon: '🙏',
    postCount: 890,
    color: '#4A0080',
  },
  createdAt: new Date(Date.now() - 7200000),
  likes: 234,
  replies: 89,
  views: 890,
  isPinned: true,
  isLocked: false,
  isLiked: true,
  tags: ['prayer', 'family', 'healing'],
};

const mockReplies: ForumReply[] = [
  {
    id: '1',
    postId: '2',
    author: {
      id: '1',
      username: 'PastorMichael',
      email: 'pastor@holycultureradio.com',
      createdAt: new Date(),
      isVerified: true,
      role: 'admin',
    },
    content: 'Praying for your mother and your entire family. Remember that God is the Great Physician and He hears our prayers. Stay strong in faith! 🙏',
    createdAt: new Date(Date.now() - 6000000),
    likes: 45,
    isLiked: true,
  },
  {
    id: '2',
    postId: '2',
    author: {
      id: '3',
      username: 'FaithfulSarah',
      email: 'sarah@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    content: 'Lifting your family up in prayer right now. God is able to do immeasurably more than we ask or imagine. Believe and trust in His plan. ❤️',
    createdAt: new Date(Date.now() - 5400000),
    likes: 28,
    isLiked: false,
  },
  {
    id: '3',
    postId: '2',
    author: {
      id: '4',
      username: 'GraceAbounds',
      email: 'grace@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    content: 'I went through something similar with my father last year. God brought him through and He will do the same for your mother. Praying for complete healing! 🙌',
    createdAt: new Date(Date.now() - 4800000),
    likes: 19,
    isLiked: false,
  },
  {
    id: '4',
    postId: '2',
    author: {
      id: '5',
      username: 'HopeInChrist',
      email: 'hope@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    content: 'Isaiah 41:10 - "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." Standing in agreement with you! 🙏',
    createdAt: new Date(Date.now() - 3600000),
    likes: 34,
    isLiked: true,
  },
];

export default function ForumPostScreen() {
  const route = useRoute<ForumPostRouteProp>();
  const [isLiked, setIsLiked] = useState(mockPost.isLiked);
  const [likes, setLikes] = useState(mockPost.likes);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(mockReplies);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    const newReply: ForumReply = {
      id: String(Date.now()),
      postId: mockPost.id,
      author: {
        id: 'current-user',
        username: 'You',
        email: 'user@example.com',
        createdAt: new Date(),
        isVerified: false,
        role: 'member',
      },
      content: replyText.trim(),
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
    };

    setReplies([...replies, newReply]);
    setReplyText('');
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: mockPost.category.color }]}>
            <Text style={styles.categoryBadgeText}>
              {mockPost.category.icon} {mockPost.category.name}
            </Text>
          </View>

          {mockPost.isPinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>📌 Pinned Post</Text>
            </View>
          )}

          {/* Author Info */}
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {mockPost.author.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{mockPost.author.username}</Text>
                {mockPost.author.isVerified && (
                  <Text style={styles.verifiedBadge}>✓</Text>
                )}
              </View>
              <Text style={styles.authorBio} numberOfLines={1}>{mockPost.author.bio}</Text>
              <Text style={styles.postTime}>{formatTimeAgo(mockPost.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{mockPost.title}</Text>
          <Text style={styles.postBody}>{mockPost.content}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {mockPost.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{replies.length}</Text>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>👁️</Text>
            <Text style={styles.actionText}>{mockPost.views}</Text>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🚩</Text>
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>Replies ({replies.length})</Text>

          {replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <View style={styles.replyAvatar}>
                  <Text style={styles.replyAvatarText}>
                    {reply.author.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.replyMeta}>
                  <View style={styles.replyAuthorRow}>
                    <Text style={styles.replyAuthor}>{reply.author.username}</Text>
                    {reply.author.isVerified && (
                      <Text style={styles.verifiedBadge}>✓</Text>
                    )}
                    {reply.author.role === 'admin' && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Staff</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.replyTime}>{formatTimeAgo(reply.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <View style={styles.replyFooter}>
                <TouchableOpacity style={styles.replyAction}>
                  <Text style={[styles.replyActionIcon, reply.isLiked && styles.replyActionIconActive]}>
                    {reply.isLiked ? '❤️' : '🤍'}
                  </Text>
                  <Text style={styles.replyActionText}>{reply.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.replyAction}>
                  <Text style={styles.replyActionIcon}>↩️</Text>
                  <Text style={styles.replyActionText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Reply Input */}
      {!mockPost.isLocked && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !replyText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitReply}
            disabled={!replyText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {mockPost.isLocked && (
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedText}>🔒 This discussion is locked</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  postHeader: {
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  pinnedBadge: {
    marginBottom: spacing.sm,
  },
  pinnedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  postTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  postContent: {
    padding: spacing.screenPadding,
  },
  postTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  postBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    paddingHorizontal: spacing.screenPadding,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionIconActive: {
    color: colors.primary,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  repliesSection: {
    padding: spacing.screenPadding,
  },
  repliesTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  replyCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  replyAvatarText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  replyMeta: {
    flex: 1,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyAuthor: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
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
  replyTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  replyContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  replyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  replyAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyActionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  replyActionIconActive: {
    color: colors.primary,
  },
  replyActionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bottomSpacing: {
    height: 100,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyInput: {
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
  lockedBanner: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  lockedText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
