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

// Radio stream — replace with the actual stream URL found via browser DevTools
// while playing https://www.radio.net/s/holycultureradio (Network > Media tab)
export const RADIO_STREAM_URL = 'REPLACE_WITH_STREAM_URL';
export const RADIO_STATION_NAME = 'Holy Culture Radio';
export const RADIO_STATION_PAGE = 'https://www.radio.net/s/holycultureradio';
export const MEGAPHONE_API_TOKEN = '4814016a121595c1f91359f0d0fae407';
export const MEGAPHONE_NETWORK_ID = 'b89e0f6c-a940-11ec-a6dc-13c8f282cad4';
export const MEGAPHONE_API_BASE = 'https://cms.megaphone.fm/api';
