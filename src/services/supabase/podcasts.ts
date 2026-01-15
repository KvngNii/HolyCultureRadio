/**
 * Holy Culture Radio - Podcasts Service
 * CRUD operations for podcasts using Supabase
 */

import { supabase } from '../../lib/supabase';
import type { Podcast, PodcastEpisode } from '../../lib/database.types';

export interface PodcastWithSubscription extends Podcast {
  isSubscribed?: boolean;
  episodeCount?: number;
}

export interface EpisodeWithProgress extends PodcastEpisode {
  progress?: number;
  completed?: boolean;
}

class PodcastsService {
  /**
   * Get all podcasts
   */
  async getPodcasts(userId?: string) {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('Get podcasts error:', error);
      throw error;
    }

    let podcasts = data as PodcastWithSubscription[];

    // Get episode counts
    const { data: episodeCounts } = await supabase
      .from('podcast_episodes')
      .select('podcast_id')
      .in('podcast_id', podcasts.map(p => p.id));

    const countMap = (episodeCounts || []).reduce((acc, ep) => {
      acc[ep.podcast_id] = (acc[ep.podcast_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    podcasts = podcasts.map(p => ({
      ...p,
      episodeCount: countMap[p.id] || 0,
    }));

    // Check subscriptions if user is logged in
    if (userId) {
      const { data: subscriptions } = await supabase
        .from('podcast_subscriptions')
        .select('podcast_id')
        .eq('user_id', userId);

      const subscribedIds = new Set(subscriptions?.map(s => s.podcast_id) || []);

      podcasts = podcasts.map(p => ({
        ...p,
        isSubscribed: subscribedIds.has(p.id),
      }));
    }

    return podcasts;
  }

  /**
   * Get a single podcast by ID
   */
  async getPodcast(id: string, userId?: string) {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get podcast error:', error);
      throw error;
    }

    let podcast = data as PodcastWithSubscription;

    // Check subscription
    if (userId) {
      const { data: subscription } = await supabase
        .from('podcast_subscriptions')
        .select('id')
        .eq('podcast_id', id)
        .eq('user_id', userId)
        .single();

      podcast = {
        ...podcast,
        isSubscribed: !!subscription,
      };
    }

    return podcast;
  }

  /**
   * Get episodes for a podcast
   */
  async getEpisodes(podcastId: string, page: number = 1, limit: number = 20, userId?: string) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('podcast_episodes')
      .select('*', { count: 'exact' })
      .eq('podcast_id', podcastId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get episodes error:', error);
      throw error;
    }

    let episodes = data as EpisodeWithProgress[];

    // Get progress if user is logged in
    if (userId && episodes.length > 0) {
      const episodeIds = episodes.map(e => e.id);

      const { data: progress } = await supabase
        .from('episode_progress')
        .select('episode_id, progress, completed')
        .eq('user_id', userId)
        .in('episode_id', episodeIds);

      const progressMap = (progress || []).reduce((acc, p) => {
        acc[p.episode_id] = { progress: p.progress, completed: p.completed };
        return acc;
      }, {} as Record<string, { progress: number; completed: boolean }>);

      episodes = episodes.map(e => ({
        ...e,
        progress: progressMap[e.id]?.progress || 0,
        completed: progressMap[e.id]?.completed || false,
      }));
    }

    return {
      data: episodes,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get a single episode by ID
   */
  async getEpisode(id: string, userId?: string) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get episode error:', error);
      throw error;
    }

    let episode = data as EpisodeWithProgress;

    // Get progress
    if (userId) {
      const { data: progress } = await supabase
        .from('episode_progress')
        .select('progress, completed')
        .eq('episode_id', id)
        .eq('user_id', userId)
        .single();

      if (progress) {
        episode = {
          ...episode,
          progress: progress.progress,
          completed: progress.completed,
        };
      }
    }

    return episode;
  }

  /**
   * Subscribe to a podcast
   */
  async subscribe(podcastId: string, userId: string) {
    const { error } = await supabase
      .from('podcast_subscriptions')
      .insert({
        podcast_id: podcastId,
        user_id: userId,
      });

    if (error && error.code !== '23505') {
      console.error('Subscribe error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a podcast
   */
  async unsubscribe(podcastId: string, userId: string) {
    const { error } = await supabase
      .from('podcast_subscriptions')
      .delete()
      .eq('podcast_id', podcastId)
      .eq('user_id', userId);

    if (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Get subscribed podcasts
   */
  async getSubscriptions(userId: string) {
    const { data, error } = await supabase
      .from('podcast_subscriptions')
      .select(`
        podcast:podcasts(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Get subscriptions error:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item.podcast,
      isSubscribed: true,
    })) as PodcastWithSubscription[];
  }

  /**
   * Update episode progress
   */
  async updateProgress(episodeId: string, userId: string, progress: number, completed: boolean = false) {
    const { error } = await supabase
      .from('episode_progress')
      .upsert({
        episode_id: episodeId,
        user_id: userId,
        progress,
        completed,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'episode_id,user_id',
      });

    if (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  /**
   * Get recently played episodes
   */
  async getRecentlyPlayed(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('episode_progress')
      .select(`
        progress,
        completed,
        updated_at,
        episode:podcast_episodes(
          *,
          podcast:podcasts(*)
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get recently played error:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item.episode,
      progress: item.progress,
      completed: item.completed,
    }));
  }

  /**
   * Get in-progress episodes
   */
  async getInProgress(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('episode_progress')
      .select(`
        progress,
        completed,
        episode:podcast_episodes(
          *,
          podcast:podcasts(*)
        )
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .gt('progress', 0)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get in progress error:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item.episode,
      progress: item.progress,
      completed: item.completed,
    }));
  }
}

export const podcastsService = new PodcastsService();
export default podcastsService;
