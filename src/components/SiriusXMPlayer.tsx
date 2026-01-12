/**
 * Holy Culture Radio - SiriusXM WebView Player
 * Embeds SiriusXM web player for authenticated streaming
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, typography, spacing } from '../theme';

interface SiriusXMPlayerProps {
  visible: boolean;
  onClose: () => void;
}

// SiriusXM web player URL for Holy Culture Radio (Channel 154)
const SIRIUSXM_PLAYER_URL = 'https://player.siriusxm.com/holy-culture';
const SIRIUSXM_LOGIN_URL = 'https://www.siriusxm.com/login';

export default function SiriusXMPlayer({ visible, onClose }: SiriusXMPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationChange = (navState: any) => {
    // Check if user has logged in successfully
    if (navState.url.includes('player.siriusxm.com')) {
      setIsAuthenticated(true);
    }
  };

  const handleMessage = (event: any) => {
    // Handle messages from the web player
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('SiriusXM Player Event:', data);
    } catch (e) {
      // Not JSON, ignore
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SiriusXM Player</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading SiriusXM...</Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: isAuthenticated ? SIRIUSXM_PLAYER_URL : SIRIUSXM_LOGIN_URL }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          // Inject CSS to customize the player appearance
          injectedJavaScript={`
            (function() {
              // Optional: Customize the web player appearance
              const style = document.createElement('style');
              style.textContent = \`
                body { background-color: #0D0D0D !important; }
              \`;
              document.head.appendChild(style);

              // Notify the app when playback state changes
              window.addEventListener('message', function(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
              });
            })();
            true;
          `}
        />

        {/* Instructions */}
        {!isAuthenticated && (
          <View style={styles.instructionsBar}>
            <Text style={styles.instructionsText}>
              Log in with your SiriusXM account to stream Holy Culture Radio
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  instructionsBar: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
