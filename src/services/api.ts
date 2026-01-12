/**
 * Holy Culture Radio - API Service
 * Handles all API communications
 */

import { ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = 'https://api.holycultureradio.com/v1';

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null as T,
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
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
