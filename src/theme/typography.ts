/**
 * Holy Culture Radio - Official Typography
 *
 * Brand Fonts:
 * - Headers: Kelson Medium (custom font)
 * - Body Text: Helvetica
 *
 * NOTE: Kelson is a custom font that must be added to the project.
 * See instructions at bottom of this file.
 */

import { Platform, TextStyle } from 'react-native';

// Font families
const fonts = {
  // Headers - Kelson Medium (custom font, falls back to Helvetica Bold)
  header: Platform.select({
    ios: 'Kelson-Medium', // Custom font name after installation
    android: 'Kelson-Medium',
  }) || 'Helvetica-Bold',

  // Body text - Helvetica
  body: Platform.select({
    ios: 'Helvetica',
    android: 'Helvetica', // Falls back to system sans-serif on Android
  }) || 'System',

  // Helvetica variations
  helvetica: 'Helvetica',
  helveticaBold: 'Helvetica-Bold',
  helveticaLight: 'Helvetica-Light',
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
  // HEADERS (Kelson Medium)
  // ============================================
  h1: {
    fontFamily: fonts.header,
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    letterSpacing: 0.5,
  } as TextStyle,

  h2: {
    fontFamily: fonts.header,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: 0.5,
  } as TextStyle,

  h3: {
    fontFamily: fonts.header,
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
    letterSpacing: 0.25,
  } as TextStyle,

  h4: {
    fontFamily: fonts.header,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: 0.25,
  } as TextStyle,

  h5: {
    fontFamily: fonts.header,
    fontSize: 18,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
  } as TextStyle,

  // ============================================
  // BODY TEXT (Helvetica)
  // ============================================
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 26,
  } as TextStyle,

  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  } as TextStyle,

  // ============================================
  // LABELS (Helvetica)
  // ============================================
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  } as TextStyle,

  labelSmall: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,

  // ============================================
  // CAPTION (Helvetica)
  // ============================================
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  } as TextStyle,

  // ============================================
  // BUTTONS (Kelson for prominent, Helvetica for secondary)
  // ============================================
  button: {
    fontFamily: fonts.header,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
    letterSpacing: 0.75,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.5,
  } as TextStyle,

  // ============================================
  // SPECIAL STYLES
  // ============================================
  nowPlaying: {
    fontFamily: fonts.header,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    lineHeight: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } as TextStyle,

  brandTitle: {
    fontFamily: fonts.header,
    fontSize: 36,
    fontWeight: fontWeights.bold,
    lineHeight: 44,
    letterSpacing: 1,
  } as TextStyle,

  sectionTitle: {
    fontFamily: fonts.header,
    fontSize: 22,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: 0.5,
  } as TextStyle,
};

// Export font families for direct use
export { fonts };

export default typography;

/**
 * ============================================
 * HOW TO ADD KELSON FONT TO YOUR PROJECT
 * ============================================
 *
 * 1. OBTAIN THE FONT:
 *    - Kelson is a commercial font by Fontfabric
 *    - Purchase/download from: https://www.fontfabric.com/fonts/kelson/
 *    - You need: Kelson-Medium.ttf (or .otf)
 *
 * 2. ADD FONT FILES TO PROJECT:
 *    - Create folder: src/assets/fonts/
 *    - Copy Kelson-Medium.ttf to that folder
 *
 * 3. CONFIGURE REACT NATIVE:
 *
 *    Create/update react-native.config.js:
 *    ```
 *    module.exports = {
 *      project: {
 *        ios: {},
 *        android: {},
 *      },
 *      assets: ['./src/assets/fonts/'],
 *    };
 *    ```
 *
 * 4. LINK THE FONTS:
 *    ```bash
 *    npx react-native-asset
 *    ```
 *
 * 5. FOR iOS - Update Info.plist:
 *    Add to ios/HolyCultureRadio/Info.plist:
 *    ```xml
 *    <key>UIAppFonts</key>
 *    <array>
 *      <string>Kelson-Medium.ttf</string>
 *    </array>
 *    ```
 *
 * 6. REBUILD THE APP:
 *    ```bash
 *    cd ios && pod install && cd ..
 *    npm run ios
 *    ```
 *
 * FALLBACK:
 * If Kelson is not available, the app will use Helvetica-Bold
 * as a fallback for headers.
 */
