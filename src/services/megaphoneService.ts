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
const PODCASTS_CACHE_KEY = '@hcr_mg_podcasts';
const EPISODES_CACHE_PREFIX = '@hcr_mg_episodes_';
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
  const res = await fetch(url, {
    headers: {
      Authorization: AUTH_HEADER,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Megaphone API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
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
    imageUrl:            p.image_url  ?? p.imageUrl  ?? '',
    backgroundImageUrl:  p.background_image_url ?? p.backgroundImageUrl ?? null,
    episodeCount:        p.episode_count ?? p.episodeCount ?? 0,
    feedUrl:             p.feed_url  ?? p.feedUrl  ?? '',
    websiteUrl:          p.website_url ?? p.websiteUrl ?? '',
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
    pubDate:       e.pub_date    ?? e.pubDate      ?? '',
    duration:      Number(e.duration              ?? 0),
    audioUrl:      e.audio_url   ?? e.audioUrl    ?? '',
    imageUrl:      e.image_url   ?? e.imageUrl    ?? '',
    explicit:      Boolean(e.explicit),
    episodeType:   e.episode_type ?? e.episodeType ?? 'full',
    season:        e.season      ?? null,
    episodeNumber: e.episode_number ?? e.episodeNumber ?? null,
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

  const raw = await apiFetch<any[]>(`/networks/${MEGAPHONE_NETWORK_ID}/podcasts`);
  const podcasts = raw.map(mapPodcast).filter(p => p.title && p.id);

  await writeCache(PODCASTS_CACHE_KEY, podcasts);
  return podcasts;
}

/**
 * Returns the episode list for a given podcast.
 * Fetches up to `perPage` episodes per page; result is cached for 30 min.
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

  const raw = await apiFetch<any[]>(
    `/networks/${MEGAPHONE_NETWORK_ID}/podcasts/${podcastId}/episodes?page=${page}&per_page=${perPage}`
  );

  const episodes = raw
    .map(e => mapEpisode(e, podcastId))
    .filter(e => e.audioUrl); // API already gates by auth token; just need a playable URL

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
    const raw = await apiFetch<any>(
      `/networks/${MEGAPHONE_NETWORK_ID}/podcasts/${podcastId}/episodes/${episodeId}`
    );
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
  const megaphoneKeys = keys.filter(k => k.startsWith('@hcr_mg_'));
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
