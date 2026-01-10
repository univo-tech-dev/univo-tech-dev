-- FORCE FIX PROFILES RLS
-- This script drops ALL policies on profiles to ensure a clean slate

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all known policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can select all profiles" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy for SELECT
CREATE POLICY "Public Read Access"
ON profiles FOR SELECT
USING (true);

-- Re-add Update/Insert policies for app functionality
CREATE POLICY "Self Update"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Self Insert"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Grant access to authenticated and anon roles explicitly
GRANT SELECT ON profiles TO authenticated, anon;
