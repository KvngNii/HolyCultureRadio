/**
 * Holy Culture Radio - Tab Bar Icon Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
}

// Simple icon representations using basic shapes
// In production, you would use react-native-vector-icons or custom SVGs
const IconPaths: Record<string, React.ReactNode> = {
  Home: (
    <View style={styles.iconContainer}>
      <View style={[styles.homeRoof, { borderBottomColor: 'currentColor' }]} />
      <View style={[styles.homeBase, { backgroundColor: 'currentColor' }]} />
    </View>
  ),
  Radio: (
    <View style={styles.iconContainer}>
      <View style={[styles.radioWave1]} />
      <View style={[styles.radioWave2]} />
      <View style={[styles.radioDot]} />
    </View>
  ),
  Devotionals: (
    <View style={styles.iconContainer}>
      <View style={[styles.book]} />
    </View>
  ),
  Podcasts: (
    <View style={styles.iconContainer}>
      <View style={[styles.mic]} />
    </View>
  ),
  Music: (
    <View style={styles.iconContainer}>
      <View style={[styles.musicNote]} />
    </View>
  ),
  Forum: (
    <View style={styles.iconContainer}>
      <View style={[styles.forum]} />
    </View>
  ),
};

export default function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
  const iconColor = focused ? colors.primary : colors.textMuted;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.iconWrapper, focused && styles.focusedIcon]}>
        {/* Simplified icon representation */}
        <View
          style={[
            styles.simpleIcon,
            {
              backgroundColor: iconColor,
              width: size - 8,
              height: size - 8,
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 4,
  },
  focusedIcon: {
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
  },
  simpleIcon: {
    borderRadius: 4,
    opacity: 0.9,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 18,
    height: 12,
    marginTop: -2,
  },
  radioWave1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  radioWave2: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  book: {
    width: 18,
    height: 22,
    borderRadius: 2,
    borderWidth: 2,
  },
  mic: {
    width: 10,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
  },
  musicNote: {
    width: 16,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
  },
  forum: {
    width: 20,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
});
