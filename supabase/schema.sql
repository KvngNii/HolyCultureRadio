-- Holy Culture Radio - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('member', 'moderator', 'admin');

-- ============================================
-- PROFILES TABLE (extends Supabase Auth users)
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'member',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DEVOTIONALS TABLES
-- ============================================

CREATE TABLE devotionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    scripture TEXT NOT NULL,
    scripture_reference TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    audio_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devotional_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devotional_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(devotional_id, user_id)
);

CREATE TABLE devotional_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(devotional_id, user_id)
);

-- ============================================
-- PODCASTS TABLES
-- ============================================

CREATE TABLE podcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    host TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    rss_feed_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE podcast_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    image_url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE podcast_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(podcast_id, user_id)
);

CREATE TABLE episode_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(episode_id, user_id)
);

-- ============================================
-- FORUM TABLES
-- ============================================

CREATE TABLE forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================
-- RADIO SCHEDULE TABLE
-- ============================================

CREATE TABLE radio_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_name TEXT NOT NULL,
    host TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_devotionals_author ON devotionals(author_id);
CREATE INDEX idx_devotionals_created ON devotionals(created_at DESC);
CREATE INDEX idx_devotional_comments_devotional ON devotional_comments(devotional_id);
CREATE INDEX idx_podcast_episodes_podcast ON podcast_episodes(podcast_id);
CREATE INDEX idx_podcast_episodes_published ON podcast_episodes(published_at DESC);
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Devotionals policies
CREATE POLICY "Published devotionals are viewable by everyone" ON devotionals
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create devotionals" ON devotionals
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own devotionals" ON devotionals
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own devotionals" ON devotionals
    FOR DELETE USING (auth.uid() = author_id);

-- Devotional comments policies
CREATE POLICY "Comments are viewable by everyone" ON devotional_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON devotional_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON devotional_comments
    FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON devotional_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON devotional_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" ON devotional_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Saves policies
CREATE POLICY "Users can view own saves" ON devotional_saves
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save devotionals" ON devotional_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave devotionals" ON devotional_saves
    FOR DELETE USING (auth.uid() = user_id);

-- Podcasts policies
CREATE POLICY "Active podcasts are viewable by everyone" ON podcasts
    FOR SELECT USING (is_active = true);

-- Podcast episodes policies
CREATE POLICY "Episodes are viewable by everyone" ON podcast_episodes
    FOR SELECT USING (true);

-- Podcast subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON podcast_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe" ON podcast_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe" ON podcast_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Episode progress policies
CREATE POLICY "Users can view own progress" ON episode_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save progress" ON episode_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON episode_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Forum categories policies
CREATE POLICY "Categories are viewable by everyone" ON forum_categories
    FOR SELECT USING (true);

-- Forum posts policies
CREATE POLICY "Posts are viewable by everyone" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = author_id AND is_locked = false);

CREATE POLICY "Users can delete own posts" ON forum_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Forum replies policies
CREATE POLICY "Replies are viewable by everyone" ON forum_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies" ON forum_replies
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own replies" ON forum_replies
    FOR DELETE USING (auth.uid() = author_id);

-- Forum post likes policies
CREATE POLICY "Post likes are viewable by everyone" ON forum_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON forum_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON forum_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Radio schedule policies
CREATE POLICY "Schedule is viewable by everyone" ON radio_schedule
    FOR SELECT USING (is_active = true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR LIKE/UNLIKE WITH COUNT UPDATE
-- ============================================

-- Function to increment devotional likes
CREATE OR REPLACE FUNCTION increment_devotional_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devotionals SET likes_count = likes_count + 1 WHERE id = NEW.devotional_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_devotional_like
    AFTER INSERT ON devotional_likes
    FOR EACH ROW EXECUTE FUNCTION increment_devotional_likes();

-- Function to decrement devotional likes
CREATE OR REPLACE FUNCTION decrement_devotional_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devotionals SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.devotional_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_devotional_unlike
    AFTER DELETE ON devotional_likes
    FOR EACH ROW EXECUTE FUNCTION decrement_devotional_likes();

-- Function to increment forum post likes
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_like
    AFTER INSERT ON forum_post_likes
    FOR EACH ROW EXECUTE FUNCTION increment_post_likes();

-- Function to decrement forum post likes
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_unlike
    AFTER DELETE ON forum_post_likes
    FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devotionals SET comments_count = comments_count + 1 WHERE id = NEW.devotional_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_create
    AFTER INSERT ON devotional_comments
    FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

-- Function to increment reply count
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_create
    AFTER INSERT ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION increment_reply_count();

-- ============================================
-- SEED DATA (Optional - Remove in production)
-- ============================================

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES
    ('Prayer Requests', 'Share your prayer requests with the community', 'pray', '#DF213C', 1),
    ('Testimonies', 'Share how God has worked in your life', 'heart', '#A81B35', 2),
    ('Bible Study', 'Discuss scripture and share insights', 'book', '#6E010C', 3),
    ('Music & Worship', 'Discuss Christian music and worship', 'music', '#210104', 4),
    ('General Discussion', 'General topics and fellowship', 'chat', '#9C9C9C', 5);

-- Insert sample radio schedule
INSERT INTO radio_schedule (show_name, host, description, day_of_week, start_time, end_time) VALUES
    ('Morning Praise', 'DJ Blessed', 'Start your day with uplifting gospel music', 1, '06:00', '10:00'),
    ('Morning Praise', 'DJ Blessed', 'Start your day with uplifting gospel music', 2, '06:00', '10:00'),
    ('Morning Praise', 'DJ Blessed', 'Start your day with uplifting gospel music', 3, '06:00', '10:00'),
    ('Morning Praise', 'DJ Blessed', 'Start your day with uplifting gospel music', 4, '06:00', '10:00'),
    ('Morning Praise', 'DJ Blessed', 'Start your day with uplifting gospel music', 5, '06:00', '10:00'),
    ('Holy Culture Live', 'Various Hosts', 'Live interviews and discussions', 1, '12:00', '14:00'),
    ('Holy Culture Live', 'Various Hosts', 'Live interviews and discussions', 3, '12:00', '14:00'),
    ('Holy Culture Live', 'Various Hosts', 'Live interviews and discussions', 5, '12:00', '14:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 0, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 1, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 2, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 3, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 4, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 5, '18:00', '22:00'),
    ('Evening Worship', 'Minister Grace', 'Wind down with worship music', 6, '18:00', '22:00');
