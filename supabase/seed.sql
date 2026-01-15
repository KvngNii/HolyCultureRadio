-- Holy Culture Radio - Sample Data
-- Run this in Supabase SQL Editor after running schema.sql
-- This adds sample content for testing the app

-- ============================================
-- SAMPLE PODCASTS
-- ============================================

INSERT INTO podcasts (id, title, description, host, image_url, category, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111',
     'Holy Culture Daily',
     'Your daily dose of faith-based discussions, interviews with Christian artists, and uplifting conversations to start your day right.',
     'Pastor Mike',
     'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
     'Daily',
     true),
    ('22222222-2222-2222-2222-222222222222',
     'Word & Worship',
     'Deep dives into scripture with worship music interludes. Perfect for your quiet time and spiritual growth.',
     'Minister Grace',
     'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
     'Bible Study',
     true),
    ('33333333-3333-3333-3333-333333333333',
     'Gospel Music Spotlight',
     'Interviews with your favorite gospel artists, new music releases, and behind-the-scenes stories.',
     'DJ Blessed',
     'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
     'Music',
     true),
    ('44444444-4444-4444-4444-444444444444',
     'Faith & Family',
     'Practical advice for Christian families navigating modern life while keeping faith at the center.',
     'The Johnsons',
     'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
     'Family',
     true);

-- ============================================
-- SAMPLE PODCAST EPISODES
-- ============================================

INSERT INTO podcast_episodes (podcast_id, title, description, audio_url, duration, published_at) VALUES
    -- Holy Culture Daily episodes
    ('11111111-1111-1111-1111-111111111111',
     'Finding Peace in Chaos',
     'In today''s episode, we discuss practical ways to maintain your peace when life gets overwhelming. Plus, a special interview with Grammy-winning artist.',
     'https://example.com/audio/episode1.mp3',
     1800,
     NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111',
     'The Power of Gratitude',
     'Discover how a grateful heart can transform your perspective and draw you closer to God.',
     'https://example.com/audio/episode2.mp3',
     2100,
     NOW() - INTERVAL '3 days'),
    ('11111111-1111-1111-1111-111111111111',
     'Walking by Faith',
     'What does it really mean to walk by faith and not by sight? We explore this timeless truth.',
     'https://example.com/audio/episode3.mp3',
     1950,
     NOW() - INTERVAL '5 days'),

    -- Word & Worship episodes
    ('22222222-2222-2222-2222-222222222222',
     'Psalm 23: The Shepherd''s Care',
     'A verse-by-verse study of the beloved 23rd Psalm and what it means for us today.',
     'https://example.com/audio/ww1.mp3',
     2400,
     NOW() - INTERVAL '2 days'),
    ('22222222-2222-2222-2222-222222222222',
     'Romans 8: More Than Conquerors',
     'Unpacking the powerful promises in Romans 8 that remind us of our identity in Christ.',
     'https://example.com/audio/ww2.mp3',
     2700,
     NOW() - INTERVAL '7 days'),

    -- Gospel Music Spotlight episodes
    ('33333333-3333-3333-3333-333333333333',
     'Interview: Kirk Franklin',
     'An exclusive conversation with Kirk Franklin about his journey, new music, and keeping the faith.',
     'https://example.com/audio/gms1.mp3',
     3600,
     NOW() - INTERVAL '4 days'),
    ('33333333-3333-3333-3333-333333333333',
     'New Music Friday Roundup',
     'We review this week''s hottest gospel releases and share our top picks.',
     'https://example.com/audio/gms2.mp3',
     1800,
     NOW() - INTERVAL '8 days');

-- ============================================
-- Note: Devotionals and Forum Posts require a user
-- You can add them after signing up your first user
-- Or create a system user for sample content
-- ============================================

-- Create a system user for sample content (optional)
-- First, you'll need to sign up through the app, then run:

/*
-- After you have a user, get their ID from auth.users and run:

INSERT INTO devotionals (title, content, scripture, scripture_reference, author_id, tags, is_published) VALUES
    ('Starting Your Day with God',
     'Every morning presents a new opportunity to connect with our Creator. Before the busyness of the day takes over, take a moment to center yourself in His presence.\n\nPrayer is not just about asking for things—it''s about relationship. It''s about acknowledging that we need God in every moment of our lives.\n\nAs you begin this day, remember that you are loved, you are chosen, and you have purpose.',
     'This is the day that the Lord has made; let us rejoice and be glad in it.',
     'Psalm 118:24',
     'YOUR_USER_ID_HERE',
     ARRAY['morning', 'prayer', 'devotion'],
     true),
    ('Finding Strength in Weakness',
     'Paul''s words to the Corinthians remind us of a beautiful paradox in our faith: when we are weak, then we are strong.\n\nSociety tells us to hide our weaknesses, to project strength at all times. But God''s economy works differently. He uses our weaknesses to display His power.\n\nWhat weakness are you trying to hide today? Bring it to God and watch Him work.',
     'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ''s power may rest on me.',
     '2 Corinthians 12:9',
     'YOUR_USER_ID_HERE',
     ARRAY['strength', 'grace', 'weakness'],
     true),
    ('Trust in His Timing',
     'Waiting is hard. In a world of instant everything, patience feels like a forgotten virtue.\n\nBut God''s timing is perfect. He sees the full picture when we only see fragments. What feels like delay to us is often preparation.\n\nTrust that He who began a good work in you will carry it to completion. Your breakthrough is coming.',
     'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
     'Jeremiah 29:11',
     'YOUR_USER_ID_HERE',
     ARRAY['trust', 'patience', 'timing', 'hope'],
     true);

INSERT INTO forum_posts (title, content, author_id, category_id, tags) VALUES
    ('Prayer Request: Job Interview Tomorrow',
     'Hey family! I have a big job interview tomorrow and I''m feeling anxious. This opportunity could really change things for my family. Would appreciate your prayers for peace, clarity, and favor. God''s will be done!\n\nThank you all for your support. This community means so much to me.',
     'YOUR_USER_ID_HERE',
     (SELECT id FROM forum_categories WHERE name = 'Prayer Requests'),
     ARRAY['prayer', 'career', 'faith']),
    ('Testimony: God Healed My Marriage!',
     'I just had to share this testimony! Six months ago, my marriage was on the rocks. We were talking about separation.\n\nBut God! We started praying together, joined a couples Bible study, and committed to putting Christ at the center. Today, we''re stronger than ever!\n\nIf you''re struggling in your marriage, don''t give up. God is a restorer!',
     'YOUR_USER_ID_HERE',
     (SELECT id FROM forum_categories WHERE name = 'Testimonies'),
     ARRAY['testimony', 'marriage', 'restoration']),
    ('What''s your favorite worship song right now?',
     'I''ve had "Goodness of God" by Bethel on repeat lately. The lyrics just hit different every time.\n\nWhat songs are ministering to you in this season? Always looking for new worship music to add to my playlist!',
     'YOUR_USER_ID_HERE',
     (SELECT id FROM forum_categories WHERE name = 'Music & Worship'),
     ARRAY['worship', 'music', 'discussion']);
*/
