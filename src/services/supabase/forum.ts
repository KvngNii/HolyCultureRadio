/**
 * Holy Culture Radio - Forum Service
 * CRUD operations for forum posts and replies using Supabase
 */

import { supabase } from '../../lib/supabase';
import type { ForumCategory, ForumPost, ForumReply, Profile } from '../../lib/database.types';

export interface ForumPostWithAuthor extends ForumPost {
  author: Profile;
  category: ForumCategory;
  isLiked?: boolean;
}

export interface ForumReplyWithAuthor extends ForumReply {
  author: Profile;
}

class ForumService {
  /**
   * Get all forum categories
   */
  async getCategories() {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get categories error:', error);
      throw error;
    }

    return data as ForumCategory[];
  }

  /**
   * Get forum posts with pagination
   */
  async getPosts(options: {
    categoryId?: string;
    page?: number;
    limit?: number;
    userId?: string;
    searchQuery?: string;
  } = {}) {
    const { categoryId, page = 1, limit = 20, userId, searchQuery } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(*),
        category:forum_categories!forum_posts_category_id_fkey(*)
      `, { count: 'exact' });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get posts error:', error);
      throw error;
    }

    let posts = data as ForumPostWithAuthor[];

    // Check if user liked any posts
    if (userId && posts.length > 0) {
      const postIds = posts.map(p => p.id);

      const { data: likes } = await supabase
        .from('forum_post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      const likedIds = new Set(likes?.map(l => l.post_id) || []);

      posts = posts.map(p => ({
        ...p,
        isLiked: likedIds.has(p.id),
      }));
    }

    return {
      data: posts,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get a single post by ID
   */
  async getPost(id: string, userId?: string) {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(*),
        category:forum_categories!forum_posts_category_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get post error:', error);
      throw error;
    }

    let post = data as ForumPostWithAuthor;

    // Increment view count
    await supabase
      .from('forum_posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', id);

    post.views_count += 1;

    // Check if user liked
    if (userId) {
      const { data: like } = await supabase
        .from('forum_post_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', userId)
        .single();

      post = {
        ...post,
        isLiked: !!like,
      };
    }

    return post;
  }

  /**
   * Create a new forum post
   */
  async createPost(post: {
    title: string;
    content: string;
    categoryId: string;
    tags?: string[];
    images?: string[];
  }, authorId: string) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        title: post.title,
        content: post.content,
        category_id: post.categoryId,
        author_id: authorId,
        tags: post.tags || [],
        images: post.images || [],
      })
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(*),
        category:forum_categories!forum_posts_category_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Create post error:', error);
      throw error;
    }

    return data as ForumPostWithAuthor;
  }

  /**
   * Update a forum post
   */
  async updatePost(id: string, updates: Partial<{
    title: string;
    content: string;
    tags: string[];
    images: string[];
  }>) {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update post error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a forum post
   */
  async deletePost(id: string) {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('forum_post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });

    if (error && error.code !== '23505') {
      console.error('Like post error:', error);
      throw error;
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('forum_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      console.error('Unlike post error:', error);
      throw error;
    }
  }

  /**
   * Get replies for a post
   */
  async getReplies(postId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey(*)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get replies error:', error);
      throw error;
    }

    return {
      data: data as ForumReplyWithAuthor[],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Add a reply to a post
   */
  async addReply(postId: string, userId: string, content: string, parentReplyId?: string) {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        post_id: postId,
        author_id: userId,
        content,
        parent_reply_id: parentReplyId,
      })
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Add reply error:', error);
      throw error;
    }

    return data as ForumReplyWithAuthor;
  }

  /**
   * Update a reply
   */
  async updateReply(id: string, content: string) {
    const { data, error } = await supabase
      .from('forum_replies')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update reply error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a reply
   */
  async deleteReply(id: string) {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete reply error:', error);
      throw error;
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(*),
        category:forum_categories!forum_posts_category_id_fkey(*)
      `, { count: 'exact' })
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get user posts error:', error);
      throw error;
    }

    return {
      data: data as ForumPostWithAuthor[],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }
}

export const forumService = new ForumService();
export default forumService;
