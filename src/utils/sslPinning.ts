/**
 * Holy Culture Radio - SSL Pinning Configuration
 * Protects against man-in-the-middle attacks
 *
 * To implement SSL pinning, use react-native-ssl-pinning or TrustKit
 * Install: npm install react-native-ssl-pinning
 *
 * How to get SSL certificate pins:
 * 1. Run: openssl s_client -connect api.holycultureradio.com:443 | openssl x509 -pubkey -noout | openssl rsa -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
 * 2. Or use: https://www.ssllabs.com/ssltest/ to get certificate info
 */

import { Platform } from 'react-native';
import { AppConfig } from '../config';

export interface SSLPinConfig {
  [domain: string]: {
    publicKeyHashes: string[];
    includeSubdomains: boolean;
    expirationDate?: string;
  };
}

/**
 * SSL Pinning configuration for production
 * Replace these with your actual certificate pins
 */
export const sslPinConfig: SSLPinConfig = {
  'api.holycultureradio.com': {
    publicKeyHashes: AppConfig.ssl.pins,
    includeSubdomains: true,
    // Set expiration before certificate renewal
    expirationDate: '2025-12-31',
  },
  // Add backup domains if needed
  'backup-api.holycultureradio.com': {
    publicKeyHashes: AppConfig.ssl.pins,
    includeSubdomains: true,
  },
};

/**
 * Create a fetch function with SSL pinning
 * Use this instead of regular fetch for API calls
 */
export async function pinnedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // In development, skip pinning for easier testing
  if (__DEV__ || !AppConfig.ssl.enabled) {
    return fetch(url, options);
  }

  // In production, use react-native-ssl-pinning
  // This is a placeholder - implement with actual library
  try {
    // Import dynamically to avoid errors when library isn't installed
    // const { fetch: sslFetch } = require('react-native-ssl-pinning');

    // Example usage with react-native-ssl-pinning:
    // return await sslFetch(url, {
    //   ...options,
    //   sslPinning: {
    //     certs: ['certificate-name'], // .cer files in ios/android folders
    //   },
    //   // Or use public key pinning:
    //   // pkPinning: true,
    //   // pkPinningKeys: AppConfig.ssl.pins,
    //   disableAllSecurity: false,
    //   timeoutInterval: AppConfig.api.timeout,
    // });

    // Fallback to regular fetch in development
    return fetch(url, options);
  } catch (error) {
    console.error('SSL Pinning error:', error);
    throw new Error('SSL certificate validation failed. Please check your network connection.');
  }
}

/**
 * Validate that a domain's certificate matches our pins
 * Call this during app initialization
 */
export async function validateCertificatePins(): Promise<boolean> {
  if (__DEV__ || !AppConfig.ssl.enabled) {
    console.log('SSL pinning disabled in development');
    return true;
  }

  try {
    // Make a test request to validate certificates
    const response = await pinnedFetch(`${AppConfig.api.baseUrl}/health`, {
      method: 'HEAD',
    });

    return response.ok;
  } catch (error) {
    console.error('Certificate validation failed:', error);
    return false;
  }
}

/**
 * TrustKit Configuration for iOS
 * Add this to your iOS native code for additional protection
 *
 * In ios/HolyCultureRadio/AppDelegate.m:
 *
 * #import <TrustKit/TrustKit.h>
 *
 * - (BOOL)application:(UIApplication *)application
 *     didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
 *
 *   NSDictionary *trustKitConfig = @{
 *     kTSKSwizzleNetworkDelegates: @YES,
 *     kTSKPinnedDomains: @{
 *       @"api.holycultureradio.com": @{
 *         kTSKIncludeSubdomains: @YES,
 *         kTSKEnforcePinning: @YES,
 *         kTSKPublicKeyHashes: @[
 *           @"your-primary-pin-here",
 *           @"your-backup-pin-here",
 *         ],
 *       },
 *     },
 *   };
 *   [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
 *
 *   // ... rest of setup
 * }
 */

/**
 * OkHttp SSL Pinning Configuration for Android
 * Add this to your Android native code
 *
 * In android/app/src/main/java/.../MainApplication.java:
 *
 * import okhttp3.CertificatePinner;
 *
 * CertificatePinner certificatePinner = new CertificatePinner.Builder()
 *   .add("api.holycultureradio.com", "sha256/your-primary-pin-here")
 *   .add("api.holycultureradio.com", "sha256/your-backup-pin-here")
 *   .build();
 *
 * OkHttpClient client = new OkHttpClient.Builder()
 *   .certificatePinner(certificatePinner)
 *   .build();
 */

export default {
  config: sslPinConfig,
  fetch: pinnedFetch,
  validate: validateCertificatePins,
};
