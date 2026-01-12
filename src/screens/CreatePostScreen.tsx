/**
 * Holy Culture Radio - Create Post Screen
 * Create new forum posts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { ForumCategory } from '../types';

// Mock categories
const categories: ForumCategory[] = [
  { id: '1', name: 'General Discussion', description: 'Chat about anything', icon: '💬', postCount: 1250, color: '#C41E3A' },
  { id: '2', name: 'Prayer Requests', description: 'Share your prayer needs', icon: '🙏', postCount: 890, color: '#4A0080' },
  { id: '3', name: 'Testimonies', description: 'Share what God has done', icon: '✨', postCount: 456, color: '#FFD700' },
  { id: '4', name: 'Music Talk', description: 'Discuss Christian music', icon: '🎵', postCount: 678, color: '#1DB954' },
  { id: '5', name: 'Bible Study', description: 'Scripture discussions', icon: '📖', postCount: 543, color: '#4169E1' },
  { id: '6', name: 'New Believers', description: 'Welcome to the family', icon: '🌱', postCount: 234, color: '#32CD32' },
];

const suggestedTags = [
  'faith', 'prayer', 'worship', 'testimony', 'bible', 'music',
  'encouragement', 'discussion', 'question', 'help', 'praise',
];

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your post.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write some content for your post.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for your post.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Post Created!',
        'Your post has been submitted to the community.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const isValid = title.trim() && content.trim() && selectedCategory;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  selectedCategory === category.id && styles.categoryPillActive,
                  { borderColor: category.color },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={150}
          />
          <Text style={styles.charCount}>{title.length}/150</Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Share your thoughts, questions, or prayer requests with the community..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Tags Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Select up to 5 tags to help others find your post</Text>
          <View style={styles.tagsGrid}>
            {suggestedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagPill,
                  selectedTags.includes(tag) && styles.tagPillActive,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextActive,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Community Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Be respectful and kind to all members{'\n'}
            • Keep discussions appropriate and family-friendly{'\n'}
            • Do not share personal contact information{'\n'}
            • Report any inappropriate content
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Posting...' : 'Post to Community'}
          </Text>
        </TouchableOpacity>
      </View>
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
  section: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    marginHorizontal: -spacing.screenPadding,
    paddingHorizontal: spacing.screenPadding,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryName: {
    ...typography.label,
    color: colors.textSecondary,
  },
  categoryNameActive: {
    color: colors.textOnPrimary,
  },
  titleInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.inputBorderRadius,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  contentInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.inputBorderRadius,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tagTextActive: {
    color: colors.textOnPrimary,
  },
  guidelinesSection: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guidelinesTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guidelinesText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    padding: spacing.screenPadding,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.buttonBorderRadius,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});
