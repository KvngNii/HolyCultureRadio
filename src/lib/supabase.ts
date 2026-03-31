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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Supabase configuration
const SUPABASE_URL = 'https://srdiekduisqhdxvcisvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZGlla2R1aXNxaGR4dmNpc3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njg5NjQsImV4cCI6MjA4NDA0NDk2NH0.QG7wCWy_xazDYd_GpGTbS8kKiqWeFxKOFYOFFHyxATQ';

// Create Supabase client with React Native specific configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
  global: {
    headers: {
      'X-Client-Info': 'holy-culture-radio-ios',
    },
  },
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'https://your-project.supabase.co' &&
    SUPABASE_ANON_KEY !== 'your-anon-key'
  );
};

// Export configuration for debugging
export const supabaseConfig = {
  url: SUPABASE_URL,
  isConfigured: isSupabaseConfigured(),
};

export default supabase;
