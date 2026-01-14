/**
 * Holy Culture Radio - Authentication Service
 * Secure authentication with token management, biometrics, and session handling
 */

import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { API_CONFIG } from './api';
import { loginRateLimiter, passwordResetRateLimiter } from '../utils/validation';

// Auth configuration
const AUTH_CONFIG = {
  TOKEN_KEY: 'holy_culture_auth_token',
  REFRESH_TOKEN_KEY: 'holy_culture_refresh_token',
  USER_KEY: 'holy_culture_user',
  BIOMETRIC_KEY: 'holy_culture_biometric',
  TOKEN_EXPIRY_BUFFER: 300000, // 5 minutes before actual expiry
  SESSION_TIMEOUT: 3600000, // 1 hour
};

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Auth state listeners
type AuthStateListener = (isAuthenticated: boolean, user: User | null) => void;
const authStateListeners: AuthStateListener[] = [];

class AuthService {
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize auth service - call on app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to restore session from secure storage
      await this.restoreSession();
      this.isInitialized = true;
    } catch (error) {
      console.error('Auth initialization error:', error);
      await this.clearSession();
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Registration failed',
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    // Check rate limiting
    if (loginRateLimiter.isRateLimited(email)) {
      const remaining = Math.ceil(
        (300000 - (Date.now() % 300000)) / 60000
      );
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${remaining} minutes.`,
      };
    }

    loginRateLimiter.recordAttempt(email);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Invalid email or password',
        };
      }

      // Store tokens securely
      await this.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      });

      // Store user data
      this.currentUser = data.user;
      await this.saveUser(data.user);

      // Reset rate limiter on successful login
      loginRateLimiter.reset(email);

      // Schedule token refresh
      this.scheduleTokenRefresh();

      // Notify listeners
      this.notifyAuthStateChange(true, data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      if (this.tokens?.accessToken) {
        await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
          },
        }).catch(() => {}); // Ignore errors
      }
    } finally {
      await this.clearSession();
      this.notifyAuthStateChange(false, null);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    // Check rate limiting
    if (passwordResetRateLimiter.isRateLimited(email)) {
      return {
        success: false,
        error: 'Too many reset attempts. Please try again later.',
      };
    }

    passwordResetRateLimiter.recordAttempt(email);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Always return success to prevent email enumeration
      return {
        success: true,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Password reset failed',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Authenticate with biometrics (Face ID / Touch ID)
   */
  async authenticateWithBiometrics(): Promise<AuthResult> {
    try {
      // Check if biometrics are available
      const biometryType = await Keychain.getSupportedBiometryType();
      if (!biometryType) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Check if we have stored credentials for biometric login
      const credentials = await Keychain.getGenericPassword({
        service: AUTH_CONFIG.BIOMETRIC_KEY,
        authenticationPrompt: {
          title: 'Sign in to Holy Culture Radio',
          subtitle: Platform.OS === 'ios' ? 'Use Face ID or Touch ID' : 'Use your fingerprint',
          cancel: 'Cancel',
        },
      });

      if (!credentials) {
        return {
          success: false,
          error: 'Biometric login not set up. Please sign in with your password first.',
        };
      }

      // Use stored credentials to login
      const { username: email, password } = credentials;
      return await this.login(email, password);
    } catch (error) {
      console.error('Biometric auth error:', error);
      return {
        success: false,
        error: 'Biometric authentication failed',
      };
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometricAuth(email: string, password: string): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      if (!biometryType) {
        return false;
      }

      await Keychain.setGenericPassword(email, password, {
        service: AUTH_CONFIG.BIOMETRIC_KEY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      });

      return true;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuth(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: AUTH_CONFIG.BIOMETRIC_KEY });
    } catch (error) {
      console.error('Disable biometric error:', error);
    }
  }

  /**
   * Check if biometrics are available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return !!biometryType;
    } catch {
      return false;
    }
  }

  /**
   * Get biometry type (FaceID, TouchID, Fingerprint)
   */
  async getBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.tokens?.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
      });

      if (!response.ok) {
        // Refresh token expired or invalid - logout
        await this.logout();
        return false;
      }

      const data = await response.json();

      await this.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || this.tokens.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      });

      this.scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get current access token (refreshes if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      return null;
    }

    // Check if token needs refresh
    if (Date.now() >= this.tokens.expiresAt - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.tokens.accessToken;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.tokens;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(listener: AuthStateListener): () => void {
    authStateListeners.push(listener);

    // Immediately notify with current state
    listener(this.isAuthenticated(), this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(listener);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }

  // Private methods

  private notifyAuthStateChange(isAuthenticated: boolean, user: User | null): void {
    authStateListeners.forEach(listener => listener(isAuthenticated, user));
  }

  private async saveTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    try {
      await Keychain.setGenericPassword(
        'tokens',
        JSON.stringify(tokens),
        {
          service: AUTH_CONFIG.TOKEN_KEY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      console.error('Save tokens error:', error);
    }
  }

  private async saveUser(user: User): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        'user',
        JSON.stringify(user),
        {
          service: AUTH_CONFIG.USER_KEY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      console.error('Save user error:', error);
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      // Restore tokens
      const tokenCredentials = await Keychain.getGenericPassword({
        service: AUTH_CONFIG.TOKEN_KEY,
      });

      if (tokenCredentials) {
        this.tokens = JSON.parse(tokenCredentials.password);

        // Check if token is expired
        if (this.tokens && Date.now() >= this.tokens.expiresAt) {
          // Try to refresh
          const refreshed = await this.refreshToken();
          if (!refreshed) {
            throw new Error('Token refresh failed');
          }
        } else {
          this.scheduleTokenRefresh();
        }
      }

      // Restore user
      const userCredentials = await Keychain.getGenericPassword({
        service: AUTH_CONFIG.USER_KEY,
      });

      if (userCredentials) {
        this.currentUser = JSON.parse(userCredentials.password);
      }

      if (this.currentUser && this.tokens) {
        this.notifyAuthStateChange(true, this.currentUser);
      }
    } catch (error) {
      throw error;
    }
  }

  private async clearSession(): Promise<void> {
    this.currentUser = null;
    this.tokens = null;

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    try {
      await Keychain.resetGenericPassword({ service: AUTH_CONFIG.TOKEN_KEY });
      await Keychain.resetGenericPassword({ service: AUTH_CONFIG.USER_KEY });
    } catch (error) {
      console.error('Clear session error:', error);
    }
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.tokens) return;

    const refreshTime = this.tokens.expiresAt - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER - Date.now();

    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }
}

export const authService = new AuthService();
export default authService;
