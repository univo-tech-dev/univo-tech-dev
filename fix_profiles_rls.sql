-- Fix RLS policies for profiles table to ensure public visibility
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies to avoid conflicts (safely)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 1. Allow everyone to view profiles (essential for friend lists, search, etc.)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 2. Allow users to insert their own profile (signup)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify Friendships Policies again just in case
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view friendships" ON friendships;
CREATE POLICY "Users can view friendships"
  ON friendships FOR SELECT
  USING (true);
