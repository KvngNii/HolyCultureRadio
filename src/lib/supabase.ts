/**
 * Holy Culture Radio - Supabase Client Configuration
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Add them to your .env file:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_ANON_KEY=your-anon-key
 */

import 'react-native-url-polyfill/auto';
import EncryptedStorage from 'react-native-encrypted-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Create Supabase client with React Native specific configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: EncryptedStorage,   // Android Keystore / iOS Keychain — not plaintext
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,   // Required for React Native
  },
  global: {
    headers: {
      'X-Client-Info': 'holy-culture-radio-android',
    },
  },
});

export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 0;

export default supabase;
