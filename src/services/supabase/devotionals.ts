/**
 * Holy Culture Radio - Devotionals Service
 * CRUD operations for devotionals using Supabase
 */

import { supabase } from '../../lib/supabase';
import type { Devotional, DevotionalComment, Profile } from '../../lib/database.types';

export interface DevotionalWithAuthor extends Devotional {
  author: Profile;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface DevotionalCommentWithAuthor extends DevotionalComment {
  author: Profile;
}

class DevotionalsService {
  /**
   * Get all devotionals with pagination
   */
  async getDevotionals(page: number = 1, limit: number = 10, userId?: string) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('devotionals')
      .select(`
        *,
        author:profiles!devotionals_author_id_fkey(*)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get devotionals error:', error);
      throw error;
    }

    // If user is logged in, check likes and saves
    let devotionals = data as DevotionalWithAuthor[];

    if (userId && devotionals.length > 0) {
      const devotionalIds = devotionals.map(d => d.id);

      // Get user's likes
      const { data: likes } = await supabase
        .from('devotional_likes')
        .select('devotional_id')
        .eq('user_id', userId)
        .in('devotional_id', devotionalIds);

      // Get user's saves
      const { data: saves } = await supabase
        .from('devotional_saves')
        .select('devotional_id')
        .eq('user_id', userId)
        .in('devotional_id', devotionalIds);

      const likedIds = new Set(likes?.map(l => l.devotional_id) || []);
      const savedIds = new Set(saves?.map(s => s.devotional_id) || []);

      devotionals = devotionals.map(d => ({
        ...d,
        isLiked: likedIds.has(d.id),
        isSaved: savedIds.has(d.id),
      }));
    }

    return {
      data: devotionals,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get a single devotional by ID
   */
  async getDevotional(id: string, userId?: string) {
    const { data, error } = await supabase
      .from('devotionals')
      .select(`
        *,
        author:profiles!devotionals_author_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get devotional error:', error);
      throw error;
    }

    let devotional = data as DevotionalWithAuthor;

    if (userId) {
      // Check if user liked
      const { data: like } = await supabase
        .from('devotional_likes')
        .select('id')
        .eq('devotional_id', id)
        .eq('user_id', userId)
        .single();

      // Check if user saved
      const { data: save } = await supabase
        .from('devotional_saves')
        .select('id')
        .eq('devotional_id', id)
        .eq('user_id', userId)
        .single();

      devotional = {
        ...devotional,
        isLiked: !!like,
        isSaved: !!save,
      };
    }

    return devotional;
  }

  /**
   * Create a new devotional
   */
  async createDevotional(devotional: {
    title: string;
    content: string;
    scripture: string;
    scriptureReference: string;
    imageUrl?: string;
    audioUrl?: string;
    tags?: string[];
  }, authorId: string) {
    const { data, error } = await supabase
      .from('devotionals')
      .insert({
        title: devotional.title,
        content: devotional.content,
        scripture: devotional.scripture,
        scripture_reference: devotional.scriptureReference,
        author_id: authorId,
        image_url: devotional.imageUrl,
        audio_url: devotional.audioUrl,
        tags: devotional.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Create devotional error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a devotional
   */
  async updateDevotional(id: string, updates: Partial<{
    title: string;
    content: string;
    scripture: string;
    scriptureReference: string;
    imageUrl?: string;
    audioUrl?: string;
    tags?: string[];
    isPublished?: boolean;
  }>) {
    const { data, error } = await supabase
      .from('devotionals')
      .update({
        title: updates.title,
        content: updates.content,
        scripture: updates.scripture,
        scripture_reference: updates.scriptureReference,
        image_url: updates.imageUrl,
        audio_url: updates.audioUrl,
        tags: updates.tags,
        is_published: updates.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update devotional error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a devotional
   */
  async deleteDevotional(id: string) {
    const { error } = await supabase
      .from('devotionals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete devotional error:', error);
      throw error;
    }
  }

  /**
   * Like a devotional
   */
  async likeDevotional(devotionalId: string, userId: string) {
    const { error } = await supabase
      .from('devotional_likes')
      .insert({
        devotional_id: devotionalId,
        user_id: userId,
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Like devotional error:', error);
      throw error;
    }
  }

  /**
   * Unlike a devotional
   */
  async unlikeDevotional(devotionalId: string, userId: string) {
    const { error } = await supabase
      .from('devotional_likes')
      .delete()
      .eq('devotional_id', devotionalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Unlike devotional error:', error);
      throw error;
    }
  }

  /**
   * Save a devotional
   */
  async saveDevotional(devotionalId: string, userId: string) {
    const { error } = await supabase
      .from('devotional_saves')
      .insert({
        devotional_id: devotionalId,
        user_id: userId,
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Save devotional error:', error);
      throw error;
    }
  }

  /**
   * Unsave a devotional
   */
  async unsaveDevotional(devotionalId: string, userId: string) {
    const { error } = await supabase
      .from('devotional_saves')
      .delete()
      .eq('devotional_id', devotionalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Unsave devotional error:', error);
      throw error;
    }
  }

  /**
   * Get saved devotionals for a user
   */
  async getSavedDevotionals(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('devotional_saves')
      .select(`
        devotional:devotionals(
          *,
          author:profiles!devotionals_author_id_fkey(*)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get saved devotionals error:', error);
      throw error;
    }

    const devotionals = (data || []).map(item => ({
      ...item.devotional,
      isSaved: true,
    })) as DevotionalWithAuthor[];

    return {
      data: devotionals,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get comments for a devotional
   */
  async getComments(devotionalId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('devotional_comments')
      .select(`
        *,
        author:profiles!devotional_comments_author_id_fkey(*)
      `, { count: 'exact' })
      .eq('devotional_id', devotionalId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get comments error:', error);
      throw error;
    }

    return {
      data: data as DevotionalCommentWithAuthor[],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Add a comment to a devotional
   */
  async addComment(devotionalId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('devotional_comments')
      .insert({
        devotional_id: devotionalId,
        author_id: userId,
        content,
      })
      .select(`
        *,
        author:profiles!devotional_comments_author_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Add comment error:', error);
      throw error;
    }

    return data as DevotionalCommentWithAuthor;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('devotional_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  }
}

export const devotionalsService = new DevotionalsService();
export default devotionalsService;
