/**
 * Holy Culture Radio - useColors Hook
 * Returns the current theme colors based on dark/light mode
 */

import { useTheme } from '../contexts/ThemeContext';
import { darkColors, lightColors } from '../theme/colors';

export function useColors() {
  const { isDarkMode } = useTheme();
  return isDarkMode ? darkColors : lightColors;
}

export default useColors;
