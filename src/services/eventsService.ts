/**
 * Holy Culture Radio - Events Service
 *
 * Manages caching of events scraped from https://holyculture.net/events.
 * The actual DOM extraction happens inside a hidden WebView in EventsScreen
 * (real browser rendering bypasses bot-detection that blocks server requests).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HolyCultureEvent } from '../types';

const CACHE_KEY = '@hcr_events_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const EVENTS_URL = 'https://holyculture.net/events';

interface EventsCache {
  events: HolyCultureEvent[];
  fetchedAt: number;
}

// JavaScript injected into the WebView once the page finishes loading.
// Tries multiple selectors used by The Events Calendar (WordPress plugin)
// and falls back to JSON-LD structured data if DOM elements aren't found.
export const EVENTS_EXTRACTOR_JS = `
(function() {
  try {
    var events = [];

    // --- Strategy 1: The Events Calendar plugin DOM ---
    var candidateSelectors = [
      '.tribe-events-list-event',
      '.type-tribe_events',
      'article[class*="tribe-event"]',
      '.tribe-common-g-row--gutters',
      '.tribe-events-calendar-list__event-row',
      '[data-js="tribe-event-url"]',
      '.tribe_events_cat',
    ];

    var articles = [];
    for (var s = 0; s < candidateSelectors.length; s++) {
      var found = document.querySelectorAll(candidateSelectors[s]);
      if (found.length > 0) {
        articles = Array.from(found);
        break;
      }
    }

    articles.forEach(function(article) {
      var titleEl = article.querySelector(
        '.tribe-events-list-event-title a, ' +
        '.tribe-event-url, ' +
        '[class*="tribe-events-calendar-list__event-title"] a, ' +
        '[class*="tribe-event-title"] a, ' +
        'h2 a, h3 a, h1 a'
      );
      var dateEl = article.querySelector(
        '.tribe-event-date-start, ' +
        '.tribe-events-start-datetime, ' +
        '[class*="tribe-events-calendar-list__event-date"], ' +
        '[class*="tribe-event-date"], ' +
        'time, abbr[title]'
      );
      var venueEl = article.querySelector(
        '.tribe-venue, ' +
        '.tribe-address, ' +
        '[class*="tribe-events-calendar-list__event-venue"], ' +
        '[class*="tribe-venue"], ' +
        '.tribe-events-venue-location'
      );
      var imgEl = article.querySelector('img');
      var linkEl = article.querySelector('a[href*="/events/"]') || article.querySelector('a');

      if (titleEl) {
        var url = (titleEl.href || (linkEl && linkEl.href) || '');
        // Derive a stable id from the URL slug
        var slug = url.replace(/\\/+$/, '').split('/').pop() || String(Date.now() + events.length);
        events.push({
          id: slug,
          title: titleEl.innerText.trim(),
          url: url,
          date: dateEl ? (dateEl.getAttribute('title') || dateEl.innerText).trim() : '',
          venue: venueEl ? venueEl.innerText.trim() : '',
          imageUrl: imgEl ? imgEl.src : '',
        });
      }
    });

    // --- Strategy 2: JSON-LD structured data ---
    if (events.length === 0) {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length; i++) {
        try {
          var data = JSON.parse(scripts[i].innerText || scripts[i].textContent || '');
          var items = Array.isArray(data) ? data : (data['@graph'] ? data['@graph'] : [data]);
          items.forEach(function(item) {
            if (item['@type'] === 'Event') {
              var slug = (item.url || '').replace(/\\/+$/, '').split('/').pop() || String(Date.now() + events.length);
              events.push({
                id: slug,
                title: item.name || '',
                url: item.url || '',
                date: item.startDate || '',
                endDate: item.endDate || '',
                venue: (item.location && item.location.name) ? item.location.name : '',
                imageUrl: Array.isArray(item.image) ? item.image[0] : (item.image || ''),
                description: item.description || '',
              });
            }
          });
        } catch(e) {}
      }
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EVENTS_DATA', events: events }));
  } catch (err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EVENTS_ERROR', error: String(err) }));
  }
})();
`;

export { EVENTS_URL };

export async function getCachedEvents(): Promise<{ events: HolyCultureEvent[]; isStale: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: EventsCache = JSON.parse(raw);
    const isStale = Date.now() - cache.fetchedAt > CACHE_TTL_MS;
    return { events: cache.events, isStale };
  } catch {
    return null;
  }
}

export async function cacheEvents(events: HolyCultureEvent[]): Promise<void> {
  const cache: EventsCache = { events, fetchedAt: Date.now() };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function clearEventsCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
