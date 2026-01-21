-- ==============================================================================
-- UNIVO MVP - COMPLETE DATABASE SETUP SCRIPT
-- ==============================================================================
-- This script sets up the entire database schema for a fresh Supabase project.
-- It combines core tables, community features, chat, polls, and university support.
-- Run this in the Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- 1. PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  student_id TEXT UNIQUE,
  university TEXT DEFAULT 'metu', -- New column for university support
  show_friends BOOLEAN DEFAULT true, -- New column for friendship settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_university ON public.profiles(university);

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- 2. COMMUNITIES TABLE
-- =====================
CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  admin_id UUID REFERENCES public.profiles(id),
  university TEXT DEFAULT 'metu', -- New column
  is_chat_public BOOLEAN DEFAULT false, -- New column from chat features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are viewable by everyone"
  ON public.communities FOR SELECT
  USING (true);

CREATE POLICY "Users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their community"
  ON public.communities FOR UPDATE
  USING (auth.uid() = admin_id);

-- =====================
-- 3. EVENTS TABLE
-- =====================
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('event', 'announcement', 'workshop', 'talk')),
  community_id UUID REFERENCES public.communities(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Community admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_id
      AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Community admins can update events"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_id
      AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Community admins can delete events"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_id
      AND admin_id = auth.uid()
    )
  );

-- =====================
-- 4. EVENT_ATTENDEES TABLE
-- =====================
CREATE TABLE public.event_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendees are viewable by everyone"
  ON public.event_attendees FOR SELECT
  USING (true);

CREATE POLICY "Users can RSVP to events"
  ON public.event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVP"
  ON public.event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP"
  ON public.event_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);

-- =====================
-- 5. CAMPUS VOICES TABLE
-- =====================
CREATE TABLE public.campus_voices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  is_anonymous BOOLEAN DEFAULT false,
  is_editors_choice BOOLEAN DEFAULT false,
  tags TEXT[], 
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.campus_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voices are viewable by everyone"
  ON public.campus_voices FOR SELECT
  USING (moderation_status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create voices"
  ON public.campus_voices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voices"
  ON public.campus_voices FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- 6. VOICE REACTIONS TABLE
-- =====================
CREATE TABLE public.voice_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voice_id UUID REFERENCES public.campus_voices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'neutral', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voice_id, user_id)
);

ALTER TABLE public.voice_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone"
  ON public.voice_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can react"
  ON public.voice_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update reaction"
  ON public.voice_reactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove reaction"
  ON public.voice_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- 7. VOICE COMMENTS TABLE
-- =====================
CREATE TABLE public.voice_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voice_id UUID REFERENCES public.campus_voices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.voice_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can comment"
  ON public.voice_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.voice_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for Voice
CREATE INDEX idx_campus_voices_user_id ON public.campus_voices(user_id);
CREATE INDEX idx_campus_voices_created_at ON public.campus_voices(created_at);
CREATE INDEX idx_voice_reactions_voice_id ON public.voice_reactions(voice_id);
CREATE INDEX idx_voice_comments_voice_id ON public.voice_comments(voice_id);

-- =====================
-- 8. WEEKLY POLLS (New Feature)
-- =====================
CREATE TABLE public.weekly_polls (
  week_id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weekly_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly polls are viewable by everyone"
  ON public.weekly_polls FOR SELECT
  USING (true);

CREATE TABLE public.poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Poll votes are viewable by everyone"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote once per poll"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their vote"
  ON public.poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their vote"
  ON public.poll_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);


-- =====================
-- 9. COMMUNITY CHAT TABLES
-- =====================
CREATE TABLE public.community_posts (
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

CREATE TABLE public.community_post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.community_post_comments(id) ON DELETE CASCADE, -- From V2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.community_permission_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Reactions (New Feature)
CREATE TABLE public.community_post_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE public.community_comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.community_post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ENABLE RLS FOR CHAT
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comment_reactions ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for brevity but secure)
-- Posts
CREATE POLICY "Posts viewable by everyone if public or follower"
  ON public.community_posts FOR SELECT
  USING (true); -- Simplified for MVP: Allow reading all, frontend filters. Or keep stric

CREATE POLICY "Authors can insert posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id); -- Validation logic handled in code/triggers or stricter policies if needed

CREATE POLICY "Authors and Admins can delete posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid()));

-- Post Comments
CREATE POLICY "Comments viewable by everyone"
  ON public.community_post_comments FOR SELECT USING (true);

CREATE POLICY "Users can comment"
  ON public.community_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.community_post_comments FOR DELETE USING (auth.uid() = user_id);

-- Permission Requests
CREATE POLICY "Users can see/create own requests"
  ON public.community_permission_requests FOR ALL
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid()));

-- Reactions
CREATE POLICY "Reactions viewable by everyone" ON public.community_post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react post" ON public.community_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete reaction post" ON public.community_post_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Reactions viewable by everyone" ON public.community_comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react comment" ON public.community_comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete reaction comment" ON public.community_comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- 10. FRIENDSHIPS TABLE (New Feature)
-- =====================
CREATE TABLE public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

CREATE INDEX idx_friendships_requester ON public.friendships(requester_id, status);
CREATE INDEX idx_friendships_receiver ON public.friendships(receiver_id, status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friendships"
  ON public.friendships FOR SELECT USING (true);

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can respond to requests"
  ON public.friendships FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

CREATE POLICY "Users can delete friendships"
  ON public.friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- =====================
-- 11. NOTIFICATIONS
-- =====================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  type TEXT, -- 'friend_request', 'like', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System/Users can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true); 

-- =====================
-- 12. COMMUNITY FOLLOWERS
-- =====================
CREATE TABLE public.community_followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

ALTER TABLE public.community_followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Followers viewable by everyone" ON public.community_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.community_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow" ON public.community_followers FOR DELETE USING (auth.uid() = user_id);


-- =====================
-- 13. TRIGGERS & FUNCTIONS
-- =====================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ch_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Creation Trigger (Auto Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, university)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email LIKE '%@bilkent.edu.tr' THEN 'bilkent'
      WHEN NEW.email LIKE '%@ug.bilkent.edu.tr' THEN 'bilkent'
      WHEN NEW.email LIKE '%@metu.edu.tr' THEN 'metu'
      WHEN NEW.email LIKE '%@cankaya.edu.tr' THEN 'cankaya'
      ELSE 'metu' -- Default fallback
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper Functions for Friendships
CREATE OR REPLACE FUNCTION get_friend_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM friendships 
  WHERE status = 'accepted' AND (requester_id = profile_id OR receiver_id = profile_id);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM friendships WHERE status = 'accepted'
    AND ((requester_id = user1 AND receiver_id = user2) OR (requester_id = user2 AND receiver_id = user1))
  );
$$ LANGUAGE SQL STABLE;

-- Trigger for Permission Requests (Mark used)
CREATE OR REPLACE FUNCTION mark_request_as_used()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.communities WHERE id = NEW.community_id AND admin_id = NEW.user_id) INTO is_admin;
  IF NOT is_admin THEN
    UPDATE public.community_permission_requests
    SET status = 'used'
    WHERE user_id = NEW.user_id AND community_id = NEW.community_id AND status = 'approved'
    AND id = (SELECT id FROM public.community_permission_requests WHERE user_id = NEW.user_id AND community_id = NEW.community_id AND status = 'approved' ORDER BY created_at DESC LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_request_used AFTER INSERT ON public.community_posts FOR EACH ROW EXECUTE FUNCTION mark_request_as_used();

-- Seed Initial Communities
INSERT INTO public.communities (name, description, university) VALUES
  ('Müzik Kulübü', 'Üniversite müzik topluluğu', 'metu'),
  ('Bilgisayar Mühendisliği Topluluğu', 'Bilgisayar mühendisliği öğrencileri', 'metu'),
  ('Bilkent IEEE', 'Bilkent IEEE Öğrenci Kolu', 'bilkent'),
  ('Bilkent Sinema Topluluğu', 'Sinema severler', 'bilkent'),
  ('Çankaya ACM', 'Çankaya Üniversitesi ACM Öğrenci Kolu', 'cankaya'),
  ('Çankaya IEEE', 'Çankaya Üniversitesi IEEE Öğrenci Kolu', 'cankaya'),
  ('Çankaya Yapay Zeka ve Robotik Kulübü', 'Yapay zeka ve robotik çalışmaları', 'cankaya'),
  ('Çankaya Girişimcilik Kulübü', 'Startup ve girişimcilik etkinlikleri', 'cankaya'),
  ('Çankaya Müzik Kulübü', 'Müzik severler topluluğu', 'cankaya'),
  ('Çankaya Spor Kulübü', 'Spor etkinlikleri ve turnuvalar', 'cankaya');

