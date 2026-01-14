/**
 * Holy Culture Radio - Official Typography
 *
 * Brand Fonts:
 * - Headers: Helvetica Bold
 * - Body Text: Helvetica Regular
 *
 * Using iOS built-in Helvetica font family
 */

import { Platform, TextStyle } from 'react-native';

// Font families - Helvetica (built into iOS)
const fonts = {
  regular: Platform.select({
    ios: 'Helvetica',
    android: 'sans-serif',
  }) || 'System',

  bold: Platform.select({
    ios: 'Helvetica-Bold',
    android: 'sans-serif-medium',
  }) || 'System',

  light: Platform.select({
    ios: 'Helvetica-Light',
    android: 'sans-serif-light',
  }) || 'System',
};

const fontWeights = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

export const typography = {
  // ============================================
  // HEADERS (Helvetica Bold)
  // ============================================
  h1: {
    fontFamily: fonts.bold,
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    letterSpacing: 0.5,
  } as TextStyle,

  h2: {
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: 0.5,
  } as TextStyle,

  h3: {
    fontFamily: fonts.bold,
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
    letterSpacing: 0.25,
  } as TextStyle,

  h4: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: 0.25,
  } as TextStyle,

  h5: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
  } as TextStyle,

  // ============================================
  // BODY TEXT (Helvetica Regular)
  // ============================================
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 26,
  } as TextStyle,

  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  } as TextStyle,

  // ============================================
  // LABELS (Helvetica Regular)
  // ============================================
  label: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  } as TextStyle,

  labelSmall: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,

  // ============================================
  // CAPTION (Helvetica Regular)
  // ============================================
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  } as TextStyle,

  // ============================================
  // BUTTONS (Helvetica Bold)
  // ============================================
  button: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
    letterSpacing: 0.75,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.5,
  } as TextStyle,

  // ============================================
  // SPECIAL STYLES
  // ============================================
  nowPlaying: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    lineHeight: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } as TextStyle,

  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 36,
    fontWeight: fontWeights.bold,
    lineHeight: 44,
    letterSpacing: 1,
  } as TextStyle,

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: 0.5,
  } as TextStyle,
};

// Export font families for direct use
export { fonts };

export default typography;
