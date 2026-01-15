/**
 * Holy Culture Radio - API Service
 * Secure API communications with best practices
 */

import { ApiResponse, PaginatedResponse } from '../types';
import { AppConfig } from '../config';
import { pinnedFetch } from '../utils/sslPinning';

// Export config for use in auth service
export const API_CONFIG = {
  BASE_URL: AppConfig.api.baseUrl,
  TIMEOUT: AppConfig.api.timeout,
};

// Request ID for tracing
let requestId = 0;
const generateRequestId = () => `req_${Date.now()}_${++requestId}`;

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestTraceId = generateRequestId();

    // Security headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestTraceId,
      'X-Client-Version': '1.0.0',
      'X-Platform': 'ios',
      // Prevent caching of sensitive data
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Use SSL pinned fetch in production
      const fetchFn = AppConfig.ssl.enabled ? pinnedFetch : fetch;

      const response = await fetchFn(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses gracefully
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Log error for debugging (in production, send to error tracking service)
        if (__DEV__) {
          console.error(`API Error [${requestTraceId}]:`, {
            endpoint,
            status: response.status,
            error: data,
          });
        }

        return {
          data: null as T,
          success: false,
          error: typeof data === 'object' ? data.message : 'An error occurred',
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types
      let errorMessage = 'Network error';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.message.includes('SSL')) {
          errorMessage = 'Secure connection failed. Please check your network.';
        } else {
          errorMessage = error.message;
        }
      }

      if (__DEV__) {
        console.error(`API Error [${requestTraceId}]:`, error);
      }

      return {
        data: null as T,
        success: false,
        error: errorMessage,
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Devotionals
  async getDevotionals(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<any>>(`/devotionals?page=${page}&limit=${limit}`);
  }

  async getDevotional(id: string) {
    return this.request(`/devotionals/${id}`);
  }

  async createDevotional(data: { title: string; content: string; scripture: string; scriptureReference: string }) {
    return this.request('/devotionals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async likeDevotional(id: string) {
    return this.request(`/devotionals/${id}/like`, { method: 'POST' });
  }

  async saveDevotional(id: string) {
    return this.request(`/devotionals/${id}/save`, { method: 'POST' });
  }

  // Podcasts
  async getPodcasts() {
    return this.request('/podcasts');
  }

  async getPodcast(id: string) {
    return this.request(`/podcasts/${id}`);
  }

  async getPodcastEpisodes(podcastId: string, page: number = 1) {
    return this.request(`/podcasts/${podcastId}/episodes?page=${page}`);
  }

  async subscribeToPodcast(id: string) {
    return this.request(`/podcasts/${id}/subscribe`, { method: 'POST' });
  }

  // Forum
  async getForumCategories() {
    return this.request('/forum/categories');
  }

  async getForumPosts(categoryId?: string, page: number = 1) {
    const categoryParam = categoryId ? `&category=${categoryId}` : '';
    return this.request(`/forum/posts?page=${page}${categoryParam}`);
  }

  async getForumPost(id: string) {
    return this.request(`/forum/posts/${id}`);
  }

  async createForumPost(data: { title: string; content: string; categoryId: string; tags: string[] }) {
    return this.request('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async replyToPost(postId: string, content: string) {
    return this.request(`/forum/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async likePost(id: string) {
    return this.request(`/forum/posts/${id}/like`, { method: 'POST' });
  }

  // Radio
  async getRadioSchedule() {
    return this.request('/radio/schedule');
  }

  async getCurrentShow() {
    return this.request('/radio/current');
  }

  // User
  async getProfile(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(data: { username?: string; bio?: string; avatar?: string }) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }
}

export const api = new ApiService();
export default api;
