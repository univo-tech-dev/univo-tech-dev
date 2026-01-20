-- =========================================================
-- UNIVO - MASTER DATABASE SETUP (FINAL - ALL TABLES)
-- Run this script in your NEW Supabase Project's SQL Editor
-- =========================================================

-- 0. CLEAN START (Drop existing tables to prevent "already exists" errors)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.community_permission_requests CASCADE;
DROP TABLE IF EXISTS public.community_comment_reactions CASCADE;
DROP TABLE IF EXISTS public.community_post_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.voice_comment_reactions CASCADE;
DROP TABLE IF EXISTS public.voice_comments CASCADE;
DROP TABLE IF EXISTS public.voice_reactions CASCADE;
DROP TABLE IF EXISTS public.campus_voices CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.community_followers CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.announcement_reads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE, -- Added for migration reclaim
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  student_id TEXT,
  university TEXT DEFAULT 'metu',
  nickname TEXT,
  bio TEXT,
  class_year TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  privacy_settings JSONB DEFAULT '{"show_email":false,"show_interests":true,"show_activities":true}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  show_friends BOOLEAN DEFAULT true,
  theme_preference JSONB DEFAULT '{"theme":"system","colorTheme":"default"}'::jsonb,
  is_archived BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  notification_settings JSONB DEFAULT '{"likes":true,"follows":true,"comments":true,"mentions":true,"friend_requests":true,"email_subscription":true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. COMMUNITIES & FOLLOWERS
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  admin_id UUID REFERENCES public.profiles(id),
  university TEXT DEFAULT 'metu',
  is_chat_public BOOLEAN DEFAULT false,
  category TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_followers (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, community_id)
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Communities are viewable by everyone" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Followers select" ON public.community_followers FOR SELECT USING (true);

-- 3. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  community_id UUID REFERENCES public.communities(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  image_url TEXT,
  quota INTEGER,
  registration_link TEXT,
  maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events select" ON public.events FOR SELECT USING (true);

-- 4. CAMPUS VOICES
CREATE TABLE IF NOT EXISTS public.campus_voices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_editors_choice BOOLEAN DEFAULT false,
  image_url TEXT,
  tags TEXT[],
  moderation_status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.campus_voices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voices select" ON public.campus_voices FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = user_id);

-- 5. VOICES - REACTIONS & COMMENTS
CREATE TABLE IF NOT EXISTS public.voice_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voice_id UUID REFERENCES public.campus_voices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voice_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.voice_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voice_id UUID REFERENCES public.campus_voices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.voice_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.voice_comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.voice_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.voice_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_comment_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voice reactions select" ON public.voice_reactions FOR SELECT USING (true);
CREATE POLICY "Voice comments select" ON public.voice_comments FOR SELECT USING (true);

-- 6. COMMUNITY CHAT & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  links TEXT[],
  is_announcement BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.community_post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.community_post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_permission_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_permission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts select" ON public.community_posts FOR SELECT USING (true);

-- 7. SOCIAL (Friendships)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friendships select" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 8. NOTIFICATIONS & READ STATUS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    content_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, announcement_id)
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notify self view" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- 9. TRIGGERS (Auto-Profile Reclaim Logic)
-- This trigger runs on every NEW sign up. 
-- If the email existence in profiles, it merges the auth ID to the profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    old_profile_id UUID;
BEGIN
    -- Check if a profile with this email already exists (from migration)
    SELECT id INTO old_profile_id FROM public.profiles WHERE email = NEW.email LIMIT 1;
    
    IF old_profile_id IS NOT NULL AND old_profile_id != NEW.id THEN
        -- MERGE LOGIC: Update the existing profile to match the new Auth ID
        -- We must update ALL tables that reference this profile ID
        -- Because ID is PK, we update profiling and let FKs cascade if prepared, 
        -- but here we'll do it manually for safety.
        UPDATE public.campus_voices SET user_id = NEW.id WHERE user_id = old_profile_id;
        UPDATE public.voice_comments SET user_id = old_profile_id WHERE user_id = old_profile_id;
        UPDATE public.communities SET admin_id = NEW.id WHERE admin_id = old_profile_id;
        UPDATE public.community_posts SET user_id = NEW.id WHERE user_id = old_profile_id;
        -- Finally, update the profile ID itself. 
        -- This is a bit complex due to constraints. 
        -- Better: Delete the new profile being created and update the old one's ID.
        DELETE FROM public.profiles WHERE id = NEW.id;
        UPDATE public.profiles SET id = NEW.id WHERE id = old_profile_id;
    ELSE
        -- Standard Insert
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NEW.raw_user_meta_data->>'avatar_url')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_comm_id ON public.community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_voices_univ ON public.profiles(university);
CREATE INDEX IF NOT EXISTS idx_profile_email ON public.profiles(email);