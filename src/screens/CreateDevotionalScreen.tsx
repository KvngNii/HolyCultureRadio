/**
 * Holy Culture Radio - Create Devotional Screen
 * Allows users to write and submit their own devotionals
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { typography, spacing } from '../theme';
import { useColors } from '../hooks/useColors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const tagOptions = ['Peace', 'Faith', 'Love', 'Hope', 'Prayer', 'Worship', 'Gratitude', 'Strength'];

export default function CreateDevotionalScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scripture, setScripture] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 3
          ? [...prev, tag]
          : prev
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your devotional.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write the content of your devotional.');
      return;
    }
    if (!scripture.trim()) {
      Alert.alert('Missing Scripture', 'Please include a scripture verse.');
      return;
    }
    if (!scriptureReference.trim()) {
      Alert.alert('Missing Reference', 'Please include the scripture reference (e.g., John 3:16).');
      return;
    }
    if (selectedTags.length === 0) {
      Alert.alert('Missing Tags', 'Please select at least one tag.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase
      const { error } = await supabase
        .from('devotionals')
        .insert({
          author_id: user?.id,
          title: title.trim(),
          content: content.trim(),
          scripture: scripture.trim(),
          scripture_reference: scriptureReference.trim(),
          tags: selectedTags.map(tag => tag.toLowerCase()),
          is_published: false, // Requires admin review
        });

      if (error) {
        throw error;
      }

      setIsSubmitting(false);
      Alert.alert(
        'Devotional Submitted',
        'Your devotional has been submitted for review. Thank you for sharing!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Failed to submit devotional. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a meaningful title..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Devotional</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Share your thoughts, reflections, and insights..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>
        </View>

        {/* Scripture Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Scripture Verse</Text>
          <TextInput
            style={[styles.input, styles.scriptureInput]}
            placeholder="Enter the scripture verse..."
            placeholderTextColor={colors.textMuted}
            value={scripture}
            onChangeText={setScripture}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Scripture Reference */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Scripture Reference</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Psalm 23:1-3"
            placeholderTextColor={colors.textMuted}
            value={scriptureReference}
            onChangeText={setScriptureReference}
            maxLength={50}
          />
        </View>

        {/* Tags Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (select up to 3)</Text>
          <View style={styles.tagsContainer}>
            {tagOptions.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagPill,
                  selectedTags.includes(tag) && styles.tagPillSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Devotional'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your devotional will be reviewed before being published to ensure it aligns with our community guidelines.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    paddingTop: spacing.md,
  },
  scriptureInput: {
    height: 100,
    paddingTop: spacing.md,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tagTextSelected: {
    color: colors.textOnPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
