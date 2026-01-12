/**
 * Holy Culture Radio - Devotional Detail Screen
 * Full devotional view with comments
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
import { RootStackParamList, DevotionalComment } from '../types';

type DevotionalDetailRouteProp = RouteProp<RootStackParamList, 'DevotionalDetail'>;

// Mock data
const mockDevotional = {
  id: '1',
  title: 'Finding Peace in the Storm',
  content: `In times of trouble, we often forget that God is our refuge and strength. Today's devotional reminds us that even in the midst of life's storms, we can find peace in His presence.

Life throws many challenges our way - health concerns, relationship struggles, financial pressures, and uncertainty about the future. During these times, it's natural to feel anxious, worried, or even afraid. But God's Word reminds us that we don't have to face these storms alone.

The psalmist writes, "God is our refuge and strength, an ever-present help in trouble." This isn't just a nice sentiment - it's a powerful truth we can lean on when everything around us feels unstable.

When Jesus was in the boat with His disciples during a violent storm, He was peacefully sleeping. The disciples were terrified, but Jesus spoke to the wind and waves, "Peace, be still." And there was complete calm.

The same Jesus who calmed the Sea of Galilee wants to calm the storms in your life. He may not always remove the storm, but He will give you peace in the midst of it.

Today, whatever storm you're facing, remember:
• God is with you - He will never leave you nor forsake you
• God is for you - He works all things for your good
• God is stronger than your storm - nothing is impossible for Him

Take a moment to be still before God. Acknowledge His presence. Trust in His power. And receive His peace.`,
  scripture: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
  scriptureReference: 'Psalm 46:10',
  author: {
    id: '1',
    username: 'PastorMichael',
    email: 'pastor@holycultureradio.com',
    avatar: '',
    bio: 'Senior Pastor at Grace Community Church. Passionate about sharing God\'s love through music and the Word.',
    createdAt: new Date(),
    isVerified: true,
    role: 'admin' as const,
  },
  createdAt: new Date(),
  likes: 245,
  comments: 32,
  isLiked: false,
  isSaved: false,
  tags: ['peace', 'faith', 'trust'],
};

const mockComments: DevotionalComment[] = [
  {
    id: '1',
    devotionalId: '1',
    author: {
      id: '2',
      username: 'SisterGrace',
      email: 'grace@example.com',
      createdAt: new Date(),
      isVerified: true,
      role: 'member',
    },
    content: 'This is exactly what I needed to hear today. Going through a difficult season and this reminded me to trust God\'s timing. Amen! 🙏',
    createdAt: new Date(Date.now() - 3600000),
    likes: 12,
  },
  {
    id: '2',
    devotionalId: '1',
    author: {
      id: '3',
      username: 'BrotherDavid',
      email: 'david@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    content: 'Psalm 46:10 has been my go-to verse this year. So grateful for this devotional!',
    createdAt: new Date(Date.now() - 7200000),
    likes: 8,
  },
  {
    id: '3',
    devotionalId: '1',
    author: {
      id: '4',
      username: 'JoyfulMary',
      email: 'mary@example.com',
      createdAt: new Date(),
      isVerified: false,
      role: 'member',
    },
    content: 'The reminder that God is with us, for us, and stronger than our storms is so powerful. Thank you Pastor Michael!',
    createdAt: new Date(Date.now() - 14400000),
    likes: 15,
  },
];

export default function DevotionalDetailScreen() {
  const route = useRoute<DevotionalDetailRouteProp>();
  const [isLiked, setIsLiked] = useState(mockDevotional.isLiked);
  const [isSaved, setIsSaved] = useState(mockDevotional.isSaved);
  const [likes, setLikes] = useState(mockDevotional.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newComment: DevotionalComment = {
      id: String(Date.now()),
      devotionalId: mockDevotional.id,
      author: {
        id: 'current-user',
        username: 'You',
        email: 'user@example.com',
        createdAt: new Date(),
        isVerified: false,
        role: 'member',
      },
      content: commentText.trim(),
      createdAt: new Date(),
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

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
              {mockDevotional.author.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{mockDevotional.author.username}</Text>
              {mockDevotional.author.isVerified && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            <Text style={styles.authorBio} numberOfLines={2}>
              {mockDevotional.author.bio}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{mockDevotional.title}</Text>
        <Text style={styles.date}>
          {mockDevotional.createdAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Scripture */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>"{mockDevotional.scripture}"</Text>
          <Text style={styles.scriptureReference}>{mockDevotional.scriptureReference}</Text>
        </View>

        {/* Content */}
        <Text style={styles.content}>{mockDevotional.content}</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {mockDevotional.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

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

        {/* Prayer Section */}
        <View style={styles.prayerSection}>
          <Text style={styles.prayerTitle}>🙏 Prayer</Text>
          <Text style={styles.prayerText}>
            Lord, help me to be still in Your presence today. When the storms of life rage around me,
            remind me that You are my refuge and strength. Give me Your peace that surpasses all
            understanding. In Jesus' name, Amen.
          </Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

          {comments.map((comment) => (
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
          ))}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
