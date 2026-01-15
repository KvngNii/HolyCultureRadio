/**
 * Holy Culture Radio - App Configuration
 * Secure configuration management with environment variables
 *
 * IMPORTANT: Use react-native-config or react-native-dotenv to load .env values
 * Install: npm install react-native-config
 * Then import Config from 'react-native-config' and replace process.env references
 */

// In production, these should come from environment variables
// For development, we use defaults but they should NEVER be committed
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // In React Native, we'd use react-native-config
  // For now, using defaults for development only
  if (__DEV__) {
    return defaultValue;
  }
  return defaultValue; // Replace with Config[key] when react-native-config is set up
};

export const AppConfig = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('API_BASE_URL', 'https://api.holycultureradio.com'),
    timeout: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),
  },

  // Spotify Configuration
  spotify: {
    clientId: getEnvVar('SPOTIFY_CLIENT_ID', ''),
    redirectUri: getEnvVar('SPOTIFY_REDIRECT_URI', 'holycultureradio://spotify-callback'),
    scopes: [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'streaming',
    ],
  },

  // SiriusXM Configuration
  siriusxm: {
    apiKey: getEnvVar('SIRIUSXM_API_KEY', ''),
    channelId: 'holycultureradio',
    channelNumber: 154,
  },

  // SSL Pinning Configuration
  ssl: {
    enabled: !__DEV__, // Disable in dev for easier testing
    pins: [
      getEnvVar('SSL_PIN_PRIMARY', ''),
      getEnvVar('SSL_PIN_BACKUP', ''),
    ].filter(Boolean), // Remove empty strings
  },

  // Security Settings
  security: {
    tokenRefreshBuffer: 5 * 60 * 1000, // 5 minutes before expiry
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 5 * 60 * 1000, // 5 minutes
    passwordMinLength: 8,
    requireBiometricSetup: false,
  },

  // App Environment
  env: getEnvVar('APP_ENV', 'development'),
  isDev: __DEV__,
  isProd: !__DEV__,
};

// Validate required configuration in production
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (AppConfig.isProd) {
    if (!AppConfig.api.baseUrl) {
      errors.push('API_BASE_URL is required');
    }

    if (!AppConfig.spotify.clientId) {
      errors.push('SPOTIFY_CLIENT_ID is required');
    }

    if (AppConfig.ssl.enabled && AppConfig.ssl.pins.length === 0) {
      errors.push('SSL pins are required in production');
    }
  }

  return errors;
}

export default AppConfig;
