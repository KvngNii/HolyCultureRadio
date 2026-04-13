/**
 * Holy Culture Radio - Tab Bar Icon Component
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../hooks/useColors';

interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
}

// Map route names to icons
const iconMap: Record<string, string> = {
  Home: 'home',
  Radio: 'radio',
  Devotionals: 'book-open-page-variant',
  Podcasts: 'microphone',
  Music: 'music-note',
  Events: 'calendar-star',
  Forum: 'forum',
};

export default function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconName = iconMap[routeName] || 'circle';
  const iconColor = focused ? colors.primary : colors.textMuted;

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <Icon name={iconName} size={size} color={iconColor} />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
  },
  focusedContainer: {
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
  },
});
