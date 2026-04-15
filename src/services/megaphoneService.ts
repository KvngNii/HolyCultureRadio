/**
 * Holy Culture Radio - Megaphone Service
 *
 * Fetches Holy Culture podcasts and episodes from the Megaphone.fm API.
 * All responses are cached in AsyncStorage to reduce API calls and
 * support offline browsing after the first load.
 *
 * Cache TTLs:
 *   Podcasts list  — 1 hour  (shows don't change often)
 *   Episodes list  — 30 min  (new episodes published regularly)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MegaphonePodcast, MegaphoneEpisode } from '../types';
import {
  MEGAPHONE_API_BASE,
  MEGAPHONE_API_TOKEN,
  MEGAPHONE_NETWORK_ID,
} from '../config';

const AUTH_HEADER = `Token token=${MEGAPHONE_API_TOKEN}`;
const PODCASTS_CACHE_KEY = '@hcr_mg_podcasts_v2';
const EPISODES_CACHE_PREFIX = '@hcr_mg_episodes_v2_';
const PODCASTS_TTL = 60 * 60 * 1000;      // 1 hour
const EPISODES_TTL = 30 * 60 * 1000;      // 30 minutes

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

// ─── Low-level cache helpers ──────────────────────────────────────────────────

async function readCache<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > ttl) return null; // stale
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

// ─── API fetch helper ─────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${MEGAPHONE_API_BASE}${path}`;
  if (__DEV__) console.log('[Megaphone] GET', url);

  const res = await fetch(url, {
    headers: {
      Authorization: AUTH_HEADER,
      Accept: 'application/json',
    },
  });

  if (__DEV__) console.log('[Megaphone] status', res.status);

  if (!res.ok) {
    throw new Error(`Megaphone API error ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  if (__DEV__) console.log('[Megaphone] response (first 500 chars):', text.slice(0, 500));

  return JSON.parse(text) as T;
}

// ─── Response normalizer ──────────────────────────────────────────────────────
// The Megaphone API sometimes wraps arrays in an object keyed by resource name.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  // Try common wrapper keys
  for (const key of ['episodes', 'podcasts', 'data', 'results', 'items']) {
    if (Array.isArray(raw?.[key])) return raw[key];
  }
  if (__DEV__) {
    console.warn('[Megaphone] Unexpected response shape:', JSON.stringify(raw)?.slice(0, 300));
  }
  return [];
}

// ─── HTML stripping ───────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')   // remove tags
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Field mappers (API returns snake_case) ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPodcast(p: any): MegaphonePodcast {
  return {
    id:                  p.id       ?? p.uid       ?? '',
    title:               p.title                   ?? '',
    slug:                p.slug                    ?? '',
    summary:             stripHtml(p.summary       ?? ''),
    description:         stripHtml(p.description ?? p.summary ?? ''),
    imageUrl:            p.imageFile ?? p.image_file ?? p.image_url ?? p.imageUrl ?? '',
    backgroundImageUrl:  p.backgroundImageFile ?? p.background_image_url ?? p.backgroundImageUrl ?? null,
    episodeCount:        p.episodeCount ?? p.episode_count ?? 0,
    feedUrl:             p.feedUrl  ?? p.feed_url  ?? '',
    websiteUrl:          p.websiteUrl ?? p.website_url ?? '',
    language:            p.language ?? 'en',
    createdAt:           p.created_at ?? p.createdAt ?? '',
    updatedAt:           p.updated_at ?? p.updatedAt ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpisode(e: any, podcastId: string): MegaphoneEpisode {
  return {
    id:            e.id          ?? e.uid         ?? '',
    podcastId:     e.podcast_id  ?? e.podcastId   ?? podcastId,
    title:         e.title                        ?? '',
    summary:       stripHtml(e.summary            ?? ''),
    notes:         stripHtml(e.body ?? e.notes    ?? ''),
    // API returns lowercase 'pubdate', not pub_date or pubDate
    pubDate:       e.pubdate     ?? e.pub_date    ?? e.pubDate     ?? '',
    duration:      Number(e.duration              ?? 0),
    // API returns 'audioFile', not audio_url or audioUrl
    audioUrl:      e.audioFile   ?? e.audio_file  ?? e.audio_url   ?? e.audioUrl ?? e.enclosureUrl ?? e.enclosure_url ?? '',
    // API returns 'imageFile', not image_url or imageUrl
    imageUrl:      e.imageFile   ?? e.image_file  ?? e.image_url   ?? e.imageUrl  ?? '',
    explicit:      Boolean(e.explicit),
    episodeType:   e.episodeType ?? e.episode_type ?? 'full',
    // API returns 'seasonNumber', not season
    season:        e.seasonNumber ?? e.season_number ?? e.season   ?? null,
    // API returns 'episodeNumber' (camelCase already)
    episodeNumber: e.episodeNumber ?? e.episode_number             ?? null,
    status:        e.status                       ?? '',
    draft:         Boolean(e.draft),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all podcasts in the Holy Culture Megaphone network.
 * Result is cached for 1 hour.
 */
export async function getPodcasts(forceRefresh = false): Promise<MegaphonePodcast[]> {
  if (!forceRefresh) {
    const cached = await readCache<MegaphonePodcast[]>(PODCASTS_CACHE_KEY, PODCASTS_TTL);
    if (cached) return cached;
  }

  const raw = await apiFetch<unknown>(`/networks/${MEGAPHONE_NETWORK_ID}/podcasts`);
  const podcasts = toArray(raw).map(mapPodcast).filter(p => p.title && p.id);

  await writeCache(PODCASTS_CACHE_KEY, podcasts);
  return podcasts;
}

/**
 * Returns the episode list for a given podcast.
 * Tries the network-scoped URL first, falls back to the simple URL.
 * Result is cached for 30 min.
 */
export async function getEpisodes(
  podcastId: string,
  page = 1,
  perPage = 20,
  forceRefresh = false
): Promise<MegaphoneEpisode[]> {
  const cacheKey = `${EPISODES_CACHE_PREFIX}${podcastId}_p${page}`;

  if (!forceRefresh) {
    const cached = await readCache<MegaphoneEpisode[]>(cacheKey, EPISODES_TTL);
    if (cached) return cached;
  }

  let rawData: unknown;
  try {
    rawData = await apiFetch<unknown>(
      `/networks/${MEGAPHONE_NETWORK_ID}/podcasts/${podcastId}/episodes?page=${page}&per_page=${perPage}`
    );
  } catch (e: any) {
    if (__DEV__) {
      console.warn('[Megaphone] Network-scoped episodes URL failed, trying simple URL:', e.message);
    }
    // Fall back to simpler endpoint
    rawData = await apiFetch<unknown>(
      `/podcasts/${podcastId}/episodes?page=${page}&per_page=${perPage}`
    );
  }

  const episodes = toArray(rawData)
    .map(e => mapEpisode(e, podcastId))
    .filter(e => e.audioUrl);

  if (__DEV__) {
    console.log(`[Megaphone] Loaded ${episodes.length} episodes for podcast ${podcastId}`);
  }

  await writeCache(cacheKey, episodes);
  return episodes;
}

/**
 * Returns a single episode. Checks episodes cache before making a request.
 */
export async function getEpisode(
  podcastId: string,
  episodeId: string
): Promise<MegaphoneEpisode | null> {
  // Check episodes cache first (avoids a network round-trip)
  const cacheKey = `${EPISODES_CACHE_PREFIX}${podcastId}_p1`;
  const cached = await readCache<MegaphoneEpisode[]>(cacheKey, EPISODES_TTL);
  if (cached) {
    const found = cached.find(e => e.id === episodeId);
    if (found) return found;
  }

  try {
    let raw: unknown;
    try {
      raw = await apiFetch<unknown>(
        `/networks/${MEGAPHONE_NETWORK_ID}/podcasts/${podcastId}/episodes/${episodeId}`
      );
    } catch {
      raw = await apiFetch<unknown>(`/episodes/${episodeId}`);
    }
    return mapEpisode(raw, podcastId);
  } catch {
    return null;
  }
}

/**
 * Clears all Megaphone caches (call on pull-to-refresh).
 */
export async function clearMegaphoneCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const megaphoneKeys = keys.filter(k => k.startsWith('@hcr_mg'));
  if (megaphoneKeys.length) await AsyncStorage.multiRemove(megaphoneKeys);
}

/**
 * Formats a duration in seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

/**
 * Formats a Megaphone pubDate to a relative string.
 */
export function formatPubDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const diffMs = Date.now() - d.getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
