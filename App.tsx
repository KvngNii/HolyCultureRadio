/**
 * Holy Culture Radio - Main App Entry Point
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { darkColors, lightColors } from './src/theme/colors';
import { supabase } from './src/lib/supabase';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * Extracts a named parameter from a URL fragment or query string.
 * Supabase puts tokens in the fragment (#) for implicit flow.
 */
function getParam(url: string, key: string): string | null {
  const fragment = url.split('#')[1] ?? '';
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const search = new URLSearchParams(fragment || query);
  return search.get(key);
}

/**
 * Processes a Supabase auth deep link.
 * Called both when the app is already open and when it cold-starts from a link.
 */
async function handleAuthUrl(url: string | null) {
  if (!url) return;

  const isAuthLink =
    url.startsWith('holycultureradio://auth/callback') ||
    url.startsWith('holycultureradio://auth/reset-password');

  if (!isAuthLink) return;

  const accessToken = getParam(url, 'access_token');
  const refreshToken = getParam(url, 'refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error && __DEV__) console.warn('[Auth] setSession error:', error.message);
  }
}

function ThemedApp() {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkColors : lightColors;

  useEffect(() => {
    // Handle deep link when app is already running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    // Handle deep link that cold-started the app
    Linking.getInitialURL().then(handleAuthUrl);

    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
