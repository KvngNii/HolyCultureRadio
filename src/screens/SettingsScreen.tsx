/**
 * Holy Culture Radio - Settings Screen
 * App settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadOnWifi, setDownloadOnWifi] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>👤</Text>
            <View>
              <Text style={styles.settingLabel}>Edit Profile</Text>
              <Text style={styles.settingDescription}>Update your name, bio, and photo</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔐</Text>
            <View>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your password</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📧</Text>
            <View>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingDescription}>user@example.com</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive alerts for new content</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📬</Text>
            <View>
              <Text style={styles.settingLabel}>Email Digest</Text>
              <Text style={styles.settingDescription}>Weekly summary of community activity</Text>
            </View>
          </View>
          <Switch
            value={emailDigest}
            onValueChange={setEmailDigest}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
          />
        </View>
      </View>

      {/* Playback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>▶️</Text>
            <View>
              <Text style={styles.settingLabel}>Auto-Play</Text>
              <Text style={styles.settingDescription}>Continue playing next episode</Text>
            </View>
          </View>
          <Switch
            value={autoPlay}
            onValueChange={setAutoPlay}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📥</Text>
            <View>
              <Text style={styles.settingLabel}>Download on Wi-Fi Only</Text>
              <Text style={styles.settingDescription}>Save mobile data</Text>
            </View>
          </View>
          <Switch
            value={downloadOnWifi}
            onValueChange={setDownloadOnWifi}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
          />
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🎧</Text>
            <View>
              <Text style={styles.settingLabel}>Audio Quality</Text>
              <Text style={styles.settingDescription}>High (320 kbps)</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
          />
        </View>
      </View>

      {/* Connected Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Services</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🎵</Text>
            <View>
              <Text style={styles.settingLabel}>Spotify</Text>
              <Text style={styles.settingDescription}>Not connected</Text>
            </View>
          </View>
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📻</Text>
            <View>
              <Text style={styles.settingLabel}>SiriusXM</Text>
              <Text style={styles.settingDescription}>Not connected</Text>
            </View>
          </View>
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>❓</Text>
            <View>
              <Text style={styles.settingLabel}>Help Center</Text>
              <Text style={styles.settingDescription}>FAQs and support articles</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💬</Text>
            <View>
              <Text style={styles.settingLabel}>Contact Us</Text>
              <Text style={styles.settingDescription}>Get in touch with our team</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>⭐</Text>
            <View>
              <Text style={styles.settingLabel}>Rate the App</Text>
              <Text style={styles.settingDescription}>Leave a review on the App Store</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📄</Text>
            <View>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔒</Text>
            <View>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📋</Text>
            <View>
              <Text style={styles.settingLabel}>Community Guidelines</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🚪</Text>
            <View>
              <Text style={[styles.settingLabel, styles.dangerText]}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <View>
              <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>Holy Culture Radio</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Holy Culture Radio</Text>
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
  section: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dangerTitle: {
    color: colors.error,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    ...typography.h3,
    color: colors.textMuted,
  },
  connectText: {
    ...typography.label,
    color: colors.primary,
  },
  dangerText: {
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  copyright: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
});
