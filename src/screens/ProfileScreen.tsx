/**
 * Holy Culture Radio - Profile Screen
 * User profile view
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { RootStackParamList } from '../types';

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

// Mock user data
const mockUser = {
  id: '1',
  username: 'BlessedBeliever',
  email: 'user@example.com',
  bio: 'Follower of Christ | Music lover | Spreading positivity one post at a time 🙏',
  createdAt: new Date('2023-06-15'),
  isVerified: true,
  role: 'member' as const,
  stats: {
    posts: 45,
    replies: 234,
    likes: 567,
    followers: 128,
    following: 89,
  },
};

const mockActivity = [
  { type: 'post', title: 'God answered my prayers!', date: new Date(Date.now() - 86400000) },
  { type: 'reply', title: 'Re: Weekly Bible Study', date: new Date(Date.now() - 172800000) },
  { type: 'devotional', title: 'Finding Peace in Chaos', date: new Date(Date.now() - 259200000) },
];

export default function ProfileScreen() {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockUser.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          {mockUser.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>

        <Text style={styles.username}>{mockUser.username}</Text>
        <Text style={styles.bio}>{mockUser.bio}</Text>
        <Text style={styles.joinDate}>Member since {formatDate(mockUser.createdAt)}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.replies}</Text>
            <Text style={styles.statLabel}>Replies</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {mockActivity.map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>
                {item.type === 'post' ? '📝' : item.type === 'reply' ? '💬' : '📖'}
              </Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityType}>
                {item.type === 'post' ? 'Created a post' : item.type === 'reply' ? 'Replied to' : 'Shared a devotional'}
              </Text>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityDate}>
                {Math.floor((Date.now() - item.date.getTime()) / 86400000)} days ago
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {[
            { icon: '🌟', name: 'Active Member', desc: 'Posted 50+ times' },
            { icon: '🙏', name: 'Prayer Warrior', desc: 'Prayed for 100+ requests' },
            { icon: '📖', name: 'Bible Scholar', desc: 'Joined 10+ Bible studies' },
            { icon: '❤️', name: 'Beloved', desc: 'Received 500+ likes' },
          ].map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
            </View>
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
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  verifiedIcon: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  joinDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.screenPadding,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    ...typography.caption,
    color: colors.textMuted,
  },
  activityTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  activityDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  badgeName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});
