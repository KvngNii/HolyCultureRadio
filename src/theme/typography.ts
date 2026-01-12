/**
 * Holy Culture Radio - Typography
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
});

const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

export const typography = {
  // Headers
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
  } as TextStyle,

  h4: {
    fontFamily,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
  } as TextStyle,

  h5: {
    fontFamily,
    fontSize: 18,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontFamily,
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 26,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  } as TextStyle,

  // Labels
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  } as TextStyle,

  labelSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
  } as TextStyle,

  // Caption
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  } as TextStyle,

  // Button
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
    letterSpacing: 0.5,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.5,
  } as TextStyle,

  // Special
  nowPlaying: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    lineHeight: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } as TextStyle,
};

export default typography;
