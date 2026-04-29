/**
 * Holy Culture Radio - Live Radio Service
 *
 * Manages the live radio stream via TrackPlayer and polls the streaming
 * server for now-playing track metadata every 30 seconds.
 */

import TrackPlayer, { State, Capability, RepeatMode } from 'react-native-track-player';
import { RADIO_STREAM_URL, RADIO_STATION_NAME } from '../config';

const POLL_INTERVAL_MS = 30_000;

export interface NowPlaying {
  title: string;
  artist: string;
  artworkUrl: string | null;
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
let onNowPlayingUpdate: ((np: NowPlaying) => void) | null = null;
let playerSetUp = false;

// ─── TrackPlayer setup ────────────────────────────────────────────────────────

export async function setupRadioPlayer(): Promise<void> {
  if (playerSetUp) return;
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause],
      notificationCapabilities: [Capability.Play, Capability.Pause],
    });
    playerSetUp = true;
  } catch {
    // Already set up by another screen — safe to continue
    playerSetUp = true;
  }
}

export async function playRadioStream(): Promise<void> {
  await setupRadioPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: 'hcr-live',
    url: RADIO_STREAM_URL,
    title: RADIO_STATION_NAME,
    artist: 'Live',
    isLiveStream: true,
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  await TrackPlayer.play();
}

export async function stopRadioStream(): Promise<void> {
  await TrackPlayer.reset().catch(() => {});
  stopNowPlayingPolling();
}

export async function getRadioState(): Promise<State> {
  return TrackPlayer.getState();
}

// ─── Now-playing polling ──────────────────────────────────────────────────────
// Attempts to fetch metadata from common streaming server endpoints.
// If the station uses Shoutcast/Icecast, swap in the correct URL pattern.

export function startNowPlayingPolling(callback: (np: NowPlaying) => void): void {
  onNowPlayingUpdate = callback;
  fetchNowPlaying(callback);
  pollTimer = setInterval(() => fetchNowPlaying(callback), POLL_INTERVAL_MS);
}

export function stopNowPlayingPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  onNowPlayingUpdate = null;
}

async function fetchNowPlaying(callback: (np: NowPlaying) => void): Promise<void> {
  // Derive a likely now-playing endpoint from the stream URL base.
  // Common patterns for Shoutcast/Icecast/radio.co are tried in order.
  const candidates = buildNowPlayingEndpoints(RADIO_STREAM_URL);
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const json = await res.json();
      const np = parseNowPlayingResponse(json);
      if (np) { callback(np); return; }
    } catch {
      // Try next candidate
    }
  }
}

function buildNowPlayingEndpoints(streamUrl: string): string[] {
  if (!streamUrl || streamUrl === 'REPLACE_WITH_STREAM_URL') return [];
  try {
    const u = new URL(streamUrl);
    const base = `${u.protocol}//${u.host}`;
    return [
      // radio.co public API
      streamUrl.replace(/\/listen$/, '').replace('streaming.radio.co', 'public.radio.co/api/v2') + '/status',
      // Shoutcast
      `${base}/stats?json=1`,
      `${base}/status-json.xsl`,
      // Icecast
      `${base}/status-json.xsl`,
    ];
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNowPlayingResponse(json: any): NowPlaying | null {
  // radio.co shape
  if (json?.current_track?.title) {
    const raw: string = json.current_track.title;
    const [artist, ...titleParts] = raw.split(' - ');
    return {
      title: titleParts.length ? titleParts.join(' - ') : raw,
      artist: titleParts.length ? artist : RADIO_STATION_NAME,
      artworkUrl: json.current_track.artwork_url_large ?? json.current_track.artwork_url ?? null,
    };
  }
  // Shoutcast shape
  if (json?.songtitle) {
    const raw: string = json.songtitle;
    const [artist, ...titleParts] = raw.split(' - ');
    return {
      title: titleParts.length ? titleParts.join(' - ') : raw,
      artist: titleParts.length ? artist : RADIO_STATION_NAME,
      artworkUrl: null,
    };
  }
  return null;
}
