-- Friendship System Migration
-- Converts follow system to friend request system

-- ============================================
-- STEP 1: CREATE FRIENDSHIPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ============================================
-- STEP 2: MIGRATE DATA FROM user_follows
-- ============================================

-- Convert mutual follows to accepted friendships
INSERT INTO friendships (requester_id, receiver_id, status, created_at)
SELECT 
  LEAST(f1.follower_id, f1.following_id) as requester_id,
  GREATEST(f1.follower_id, f1.following_id) as receiver_id,
  'accepted' as status,
  LEAST(f1.created_at, f2.created_at) as created_at
FROM user_follows f1
INNER JOIN user_follows f2 
  ON f1.follower_id = f2.following_id 
  AND f1.following_id = f2.follower_id
WHERE f1.follower_id < f1.following_id -- Avoid duplicates
ON CONFLICT (requester_id, receiver_id) DO NOTHING;

-- Convert one-way follows to pending friend requests
INSERT INTO friendships (requester_id, receiver_id, status, created_at)
SELECT 
  follower_id as requester_id,
  following_id as receiver_id,
  'pending' as status,
  created_at
FROM user_follows
WHERE NOT EXISTS (
  SELECT 1 FROM user_follows f2
  WHERE f2.follower_id = user_follows.following_id
  AND f2.following_id = user_follows.follower_id
)
ON CONFLICT (requester_id, receiver_id) DO NOTHING;

-- ============================================
-- STEP 3: UPDATE PROFILES TABLE
-- ============================================

-- Rename privacy columns
-- Rename privacy columns safely
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_followers') THEN
    ALTER TABLE profiles RENAME COLUMN show_followers TO show_friends;
  ELSE
    -- If show_followers doesn't exist, check if show_friends exists, if not add it
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_friends') THEN
      ALTER TABLE profiles ADD COLUMN show_friends BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

ALTER TABLE profiles 
DROP COLUMN IF EXISTS show_following;

-- ============================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can respond to requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendships" ON friendships;

-- Users can view all friendships (needed for friend lists)
CREATE POLICY "Users can view friendships"
  ON friendships FOR SELECT
  USING (true);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can accept/reject requests sent to them
CREATE POLICY "Users can respond to requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ============================================
-- STEP 5: HELPER FUNCTIONS
-- ============================================

-- Function to get friend count (accepted only)
CREATE OR REPLACE FUNCTION get_friend_count(profile_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM friendships 
  WHERE status = 'accepted' 
  AND (requester_id = profile_id OR receiver_id = profile_id);
$$ LANGUAGE SQL STABLE;

-- Function to check friendship status
CREATE OR REPLACE FUNCTION get_friendship_status(user1 UUID, user2 UUID)
RETURNS VARCHAR AS $$
  SELECT status 
  FROM friendships 
  WHERE (requester_id = user1 AND receiver_id = user2)
     OR (requester_id = user2 AND receiver_id = user1)
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to check if users are friends
CREATE OR REPLACE FUNCTION are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM friendships 
    WHERE status = 'accepted'
    AND ((requester_id = user1 AND receiver_id = user2)
      OR (requester_id = user2 AND receiver_id = user1))
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- STEP 6: UPDATE NOTIFICATION TYPES
-- ============================================

-- Update existing follow notifications to friend_request
UPDATE notifications 
SET type = 'friend_request'
WHERE type = 'follow';

-- ============================================
-- OPTIONAL: DROP OLD TABLE (AFTER VERIFICATION)
-- ============================================

-- Uncomment after verifying migration:
-- DROP TABLE IF EXISTS user_follows CASCADE;
