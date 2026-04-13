/**
 * Holy Culture Radio - Events Screen
 *
 * Displays upcoming events from holyculture.net/events.
 *
 * Because the website blocks server-side requests (403), events are extracted
 * using a hidden WebView (real browser rendering) with injected JavaScript.
 * Results are cached for 30 minutes in AsyncStorage. On subsequent opens the
 * cached list shows instantly while a background refresh runs silently.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useColors } from '../hooks/useColors';
import { typography, spacing, shadows } from '../theme';
import { HolyCultureEvent } from '../types';
import {
  EVENTS_URL,
  EVENTS_EXTRACTOR_JS,
  getCachedEvents,
  cacheEvents,
} from '../services/eventsService';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [events, setEvents] = useState<HolyCultureEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [extractionFailed, setExtractionFailed] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0); // increment to force reload

  const webViewRef = useRef<WebView>(null);
  // Track whether this load was user-triggered (show spinner) or background
  const isSilentRefresh = useRef(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const triggerExtraction = useCallback((silent = false) => {
    isSilentRefresh.current = silent;
    setExtractionFailed(false);
    if (!silent) setIsLoading(true);
    // Incrementing the key forces the WebView to remount and reload the URL
    setWebViewKey(k => k + 1);
  }, []);

  // ─── Boot: check cache, then load if stale/missing ────────────────────────

  useEffect(() => {
    (async () => {
      const cached = await getCachedEvents();
      if (cached && cached.events.length > 0) {
        setEvents(cached.events);
        setIsLoading(false);
        if (cached.isStale) {
          // Show cached data immediately; refresh silently in background
          triggerExtraction(true);
        }
      } else {
        // Nothing cached — must load
        triggerExtraction(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── WebView message handler ───────────────────────────────────────────────

  const handleMessage = useCallback(async (event: { nativeEvent: { data: string } }) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);

      if (payload.type === 'EVENTS_DATA') {
        if (payload.events && payload.events.length > 0) {
          setEvents(payload.events);
          await cacheEvents(payload.events);
          setExtractionFailed(false);
        } else {
          // Page loaded but no events found — show fallback WebView
          if (!isSilentRefresh.current) setExtractionFailed(true);
        }
      } else if (payload.type === 'EVENTS_ERROR') {
        console.warn('[Events] Extraction JS error:', payload.error);
        if (!isSilentRefresh.current) setExtractionFailed(true);
      }
    } catch {
      if (!isSilentRefresh.current) setExtractionFailed(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleWebViewLoad = useCallback(() => {
    // Inject the extractor script after the page finishes loading
    webViewRef.current?.injectJavaScript(EVENTS_EXTRACTOR_JS);
  }, []);

  const handleWebViewError = useCallback(() => {
    setIsLoading(false);
    setIsRefreshing(false);
    if (!isSilentRefresh.current) setExtractionFailed(true);
  }, []);

  // ─── Pull to refresh ──────────────────────────────────────────────────────

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    triggerExtraction(false);
  }, [triggerExtraction]);

  // ─── Open event in browser ────────────────────────────────────────────────

  const openEvent = useCallback((url: string) => {
    if (url) Linking.openURL(url).catch(() => {});
  }, []);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const formatDate = (raw: string) => {
    if (!raw) return '';
    // If it's an ISO date, make it human-readable
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      try {
        return new Date(raw).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return raw;
      }
    }
    return raw;
  };

  const renderEvent = ({ item, index }: { item: HolyCultureEvent; index: number }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openEvent(item.url)}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>HC</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {!!item.date && (
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {formatDate(item.date)}
            </Text>
          </View>
        )}

        {!!item.venue && (
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {item.venue}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.moreLink}>View details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No events found</Text>
      <Text style={styles.emptySubtitle}>
        Pull down to refresh or tap below to view events on the website.
      </Text>
      <TouchableOpacity
        style={styles.openWebButton}
        onPress={() => openEvent(EVENTS_URL)}
      >
        <Text style={styles.openWebButtonText}>Open holyculture.net/events</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Fallback: full-page WebView when extraction fails ────────────────────

  if (extractionFailed && events.length === 0) {
    return (
      <View style={styles.fullWebViewContainer}>
        <WebView
          source={{ uri: EVENTS_URL }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      </View>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Hidden WebView for data extraction — never shown to the user */}
      <View style={styles.hiddenWebView}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ uri: EVENTS_URL }}
          onLoadEnd={handleWebViewLoad}
          onError={handleWebViewError}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          userAgent={
            Platform.OS === 'android'
              ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
              : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          }
          // Suppress visual flicker
          opacity={0}
        />
      </View>

      {isLoading && events.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading events…</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEvent}
          contentContainerStyle={events.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Upcoming Events</Text>
              <Text style={styles.headerSubtitle}>
                From <Text style={styles.headerLink}>holyculture.net</Text>
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof import('../hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hiddenWebView: {
      width: 1,
      height: 1,
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
    },

    // Loading
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    loaderText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },

    // List
    list: {
      padding: spacing.md,
      paddingBottom: spacing.xxxl,
    },
    emptyList: {
      flexGrow: 1,
    },

    // Header
    header: {
      marginBottom: spacing.lg,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    headerLink: {
      color: colors.primary,
    },

    // Card
    card: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: spacing.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.medium,
    },
    cardImage: {
      width: '100%',
      height: 180,
      backgroundColor: colors.backgroundTertiary ?? colors.backgroundSecondary,
    },
    cardImagePlaceholder: {
      width: '100%',
      height: 120,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardImagePlaceholderText: {
      ...typography.h2,
      color: '#fff',
      fontWeight: '900',
      letterSpacing: 4,
    },
    cardBody: {
      padding: spacing.md,
    },
    cardTitle: {
      ...typography.h4,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    metaIcon: {
      fontSize: 13,
      lineHeight: 18,
    },
    metaText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 1,
    },
    cardFooter: {
      marginTop: spacing.sm,
      alignItems: 'flex-end',
    },
    moreLink: {
      ...typography.labelSmall,
      color: colors.primary,
      fontWeight: '600',
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: spacing.md,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    openWebButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: spacing.round,
    },
    openWebButtonText: {
      ...typography.button,
      color: '#fff',
    },

    // Full-page WebView fallback
    fullWebViewContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
