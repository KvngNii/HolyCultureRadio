/**
 * Holy Culture Radio - Official Color Theme
 * Based on Holy Culture Brand Guidelines
 */

export const colors = {
  // ============================================
  // PRIMARY COLORS (Official Brand)
  // ============================================
  primary: '#DF213C', // Alizarin Crimson - Main brand red
  primaryDark: '#A81B35', // Cardinal - Darker red
  primaryLight: '#DF213C', // Alizarin Crimson

  // Black variations
  secondary: '#000000', // Pure Black
  secondaryDark: '#000000', // Black
  secondaryLight: '#210104', // Temptress - Very dark red/black

  // ============================================
  // SECONDARY COLORS (Official Brand)
  // ============================================
  temptress: '#210104', // Dark red-black
  venetianRed: '#6E010C', // Deep burgundy
  cardinal: '#A81B35', // Dark red
  martini: '#C0BBBA', // Warm gray
  paleSlate: '#DAD8D9', // Light gray

  // ============================================
  // NEUTRAL COLORS
  // ============================================
  white: '#FFFFFF',
  black: '#000000',
  silverChalice: '#9C9C9C', // Medium gray
  wildSand: '#F5F5F5', // Off-white

  // ============================================
  // BACKGROUND COLORS (Dark Theme)
  // ============================================
  background: '#000000', // Pure black background
  backgroundSecondary: '#0D0D0D', // Near black
  backgroundTertiary: '#1A1A1A', // Dark gray

  // ============================================
  // SURFACE COLORS
  // ============================================
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  surfaceHighlight: '#333333',

  // ============================================
  // TEXT COLORS
  // ============================================
  textPrimary: '#FFFFFF', // White
  textSecondary: '#C0BBBA', // Martini gray
  textMuted: '#9C9C9C', // Silver Chalice
  textOnPrimary: '#FFFFFF', // White on red

  // ============================================
  // STATUS COLORS
  // ============================================
  success: '#28A745',
  warning: '#FFC107',
  error: '#DF213C', // Use brand red for errors
  info: '#17A2B8',

  // ============================================
  // UI COLORS
  // ============================================
  border: '#2A2A2A',
  borderLight: '#333333',
  divider: '#1A1A1A',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // ============================================
  // ACCENT COLORS
  // ============================================
  accent: '#DF213C', // Brand red as accent
  accentLight: '#DAD8D9', // Pale Slate

  // ============================================
  // GRADIENT COLORS
  // ============================================
  gradientStart: '#DF213C', // Alizarin Crimson
  gradientMiddle: '#A81B35', // Cardinal
  gradientEnd: '#6E010C', // Venetian Red

  // ============================================
  // PLAYER COLORS
  // ============================================
  playerBackground: '#000000',
  playerProgress: '#DF213C',
  playerBuffer: '#333333',

  // ============================================
  // FORUM COLORS
  // ============================================
  forumPost: '#0D0D0D',
  forumReply: '#1A1A1A',
  forumHighlight: '#DF213C',
};

export const gradients = {
  primary: ['#DF213C', '#A81B35', '#6E010C'], // Red gradient
  dark: ['#1A1A1A', '#000000'],
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
  header: ['#DF213C', '#000000'],
  card: ['#1A1A1A', '#0D0D0D'],
  brand: ['#DF213C', '#A81B35'], // Official brand gradient
};

// Brand color constants for easy reference
export const brandColors = {
  alizarinCrimson: '#DF213C',
  black: '#000000',
  white: '#FFFFFF',
  silverChalice: '#9C9C9C',
  wildSand: '#F5F5F5',
  temptress: '#210104',
  venetianRed: '#6E010C',
  cardinal: '#A81B35',
  martini: '#C0BBBA',
  paleSlate: '#DAD8D9',
};

export default colors;
