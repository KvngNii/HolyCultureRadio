/**
 * Holy Culture Radio - App Configuration
 *
 * Centralised location for app-wide constants.
 * Spotify Client ID and Supabase anon key are intentionally client-side values:
 *   - PKCE OAuth requires no client secret; the client ID alone cannot be abused.
 *   - Supabase anon key is designed to be public; access is enforced by Row Level Security.
 * Neither value grants privileged access on its own.
 */

// Spotify
export const SPOTIFY_CLIENT_ID = '32f987a2b6444f02b90ece924503d39f';
export const SPOTIFY_REDIRECT_URI = 'holycultureradio://spotify-callback';

// Supabase (anon key is intentionally public - protected by RLS policies)
export const SUPABASE_URL = 'https://srdiekduisqhdxvcisvb.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZGlla2R1aXNxaGR4dmNpc3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njg5NjQsImV4cCI6MjA4NDA0NDk2NH0.QG7wCWy_xazDYd_GpGTbS8kKiqWeFxKOFYOFFHyxATQ';
