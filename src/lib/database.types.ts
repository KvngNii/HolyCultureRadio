/**
 * Holy Culture Radio - Supabase Database Types
 *
 * These types are auto-generated from your Supabase schema.
 * After creating tables, you can regenerate this file using:
 * npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          role: 'member' | 'moderator' | 'admin';
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'member' | 'moderator' | 'admin';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'member' | 'moderator' | 'admin';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      devotionals: {
        Row: {
          id: string;
          title: string;
          content: string;
          scripture: string;
          scripture_reference: string;
          author_id: string;
          image_url: string | null;
          audio_url: string | null;
          likes_count: number;
          comments_count: number;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          scripture: string;
          scripture_reference: string;
          author_id: string;
          image_url?: string | null;
          audio_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          tags?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          scripture?: string;
          scripture_reference?: string;
          author_id?: string;
          image_url?: string | null;
          audio_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          tags?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      devotional_comments: {
        Row: {
          id: string;
          devotional_id: string;
          author_id: string;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          devotional_id: string;
          author_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          devotional_id?: string;
          author_id?: string;
          content?: string;
          likes_count?: number;
          created_at?: string;
        };
      };
      devotional_likes: {
        Row: {
          id: string;
          devotional_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          devotional_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          devotional_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      devotional_saves: {
        Row: {
          id: string;
          devotional_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          devotional_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          devotional_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      podcasts: {
        Row: {
          id: string;
          title: string;
          description: string;
          host: string;
          image_url: string;
          category: string;
          rss_feed_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          host: string;
          image_url: string;
          category: string;
          rss_feed_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          host?: string;
          image_url?: string;
          category?: string;
          rss_feed_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      podcast_episodes: {
        Row: {
          id: string;
          podcast_id: string;
          title: string;
          description: string;
          audio_url: string;
          duration: number;
          image_url: string | null;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          title: string;
          description: string;
          audio_url: string;
          duration: number;
          image_url?: string | null;
          published_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          title?: string;
          description?: string;
          audio_url?: string;
          duration?: number;
          image_url?: string | null;
          published_at?: string;
          created_at?: string;
        };
      };
      podcast_subscriptions: {
        Row: {
          id: string;
          podcast_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      episode_progress: {
        Row: {
          id: string;
          episode_id: string;
          user_id: string;
          progress: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          user_id: string;
          progress: number;
          completed?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          user_id?: string;
          progress?: number;
          completed?: boolean;
          updated_at?: string;
        };
      };
      forum_categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          likes_count: number;
          replies_count: number;
          views_count: number;
          is_pinned: boolean;
          is_locked: boolean;
          tags: string[];
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          likes_count?: number;
          replies_count?: number;
          views_count?: number;
          is_pinned?: boolean;
          is_locked?: boolean;
          tags?: string[];
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          category_id?: string;
          likes_count?: number;
          replies_count?: number;
          views_count?: number;
          is_pinned?: boolean;
          is_locked?: boolean;
          tags?: string[];
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_replies: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_reply_id: string | null;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_reply_id?: string | null;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          parent_reply_id?: string | null;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      radio_schedule: {
        Row: {
          id: string;
          show_name: string;
          host: string;
          description: string;
          image_url: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          show_name: string;
          host: string;
          description: string;
          image_url?: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          show_name?: string;
          host?: string;
          description?: string;
          image_url?: string | null;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'member' | 'moderator' | 'admin';
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Devotional = Database['public']['Tables']['devotionals']['Row'];
export type DevotionalComment = Database['public']['Tables']['devotional_comments']['Row'];
export type Podcast = Database['public']['Tables']['podcasts']['Row'];
export type PodcastEpisode = Database['public']['Tables']['podcast_episodes']['Row'];
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumReply = Database['public']['Tables']['forum_replies']['Row'];
export type RadioSchedule = Database['public']['Tables']['radio_schedule']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
