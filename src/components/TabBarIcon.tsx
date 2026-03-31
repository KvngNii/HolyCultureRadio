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

export default function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
  const iconColor = focused ? colors.primary : colors.textMuted;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.iconWrapper, focused && styles.focusedIcon]}>
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
});
