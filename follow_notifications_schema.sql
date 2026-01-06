-- Follow System and Notifications Schema
-- Run this migration in Supabase SQL Editor

-- ============================================
-- STEP 0: CLEAN UP EXISTING TABLES
-- ============================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- 1. Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'follow', 'like', 'comment', 'mention'
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID, -- optional: related post/comment ID
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON notifications(actor_id);

-- 3. Update profiles table with privacy settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_followers BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_following BOOLEAN DEFAULT TRUE;

-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- user_follows policies
CREATE POLICY "Users can view all follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = profile_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower UUID, following UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower AND following_id = following
  );
$$ LANGUAGE SQL STABLE;
