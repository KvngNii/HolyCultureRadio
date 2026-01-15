/**
 * Holy Culture Radio - Authentication Service
 * Secure authentication using Supabase Auth with biometrics support
 */

import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { loginRateLimiter, passwordResetRateLimiter } from '../utils/validation';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '../lib/database.types';

// Auth configuration
const AUTH_CONFIG = {
  BIOMETRIC_KEY: 'holy_culture_biometric',
};

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'member' | 'moderator' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Auth state listeners
type AuthStateListener = (isAuthenticated: boolean, user: User | null) => void;
const authStateListeners: AuthStateListener[] = [];

// Convert Supabase profile to app User
function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatar_url || undefined,
    bio: profile.bio || undefined,
    role: profile.role,
    isVerified: profile.is_verified,
    createdAt: profile.created_at,
  };
}

class AuthService {
  private currentUser: User | null = null;
  private session: Session | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize auth service - call on app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
      }

      if (session) {
        this.session = session;
        await this.fetchUserProfile(session.user.id);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        this.session = session;

        if (session) {
          await this.fetchUserProfile(session.user.id);
          this.notifyAuthStateChange(true, this.currentUser);
        } else {
          this.currentUser = null;
          this.notifyAuthStateChange(false, null);
        }
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  /**
   * Fetch user profile from Supabase
   */
  private async fetchUserProfile(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Fetch profile error:', error);
        return;
      }

      if (profile) {
        this.currentUser = profileToUser(profile);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<AuthResult> {
    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return {
          success: false,
          error: 'Username is already taken',
        };
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // This will be available in the trigger
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Registration failed',
        };
      }

      // If email confirmation is required
      if (!data.session) {
        return {
          success: true,
          error: 'Please check your email to confirm your account',
        };
      }

      // Fetch the user profile
      await this.fetchUserProfile(data.user.id);

      return {
        success: true,
        user: this.currentUser || undefined,
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
      const remaining = Math.ceil((300000 - (Date.now() % 300000)) / 60000);
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${remaining} minutes.`,
      };
    }

    loginRateLimiter.recordAttempt(email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Login failed',
        };
      }

      // Reset rate limiter on successful login
      loginRateLimiter.reset(email);

      // Fetch user profile
      await this.fetchUserProfile(data.user.id);

      return {
        success: true,
        user: this.currentUser || undefined,
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
   * Login with OAuth provider (Google, Apple, etc.)
   */
  async loginWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'holycultureradio://auth/callback',
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('OAuth login error:', error);
      return {
        success: false,
        error: 'OAuth login failed',
      };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      this.session = null;
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'holycultureradio://auth/reset-password',
      });

      if (error) {
        console.error('Password reset error:', error);
      }

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
   * Update password (when user has reset token)
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<User, 'username' | 'bio' | 'avatarUrl'>>): Promise<AuthResult> {
    if (!this.currentUser) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: updates.username,
          bio: updates.bio,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.currentUser.id);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Refresh profile
      await this.fetchUserProfile(this.currentUser.id);

      return {
        success: true,
        user: this.currentUser || undefined,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Failed to update profile',
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
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.session;
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
}

export const authService = new AuthService();
export default authService;
