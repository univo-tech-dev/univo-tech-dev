-- =========================================================
-- UNIVO - STORAGE BUCKETS & POLICIES SETUP
-- Run this in your NEW Supabase Project's SQL Editor
-- =========================================================

-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('voices', 'voices', true),
  ('voice-media', 'voice-media', true),
  ('communities', 'communities', true),
  ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies (Allow Uploads)
-- avatars: Users can upload to their own folder
CREATE POLICY "Avatar Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- voice-media: Users can upload their own media
CREATE POLICY "Voice Media Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'voice-media' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- communities: Users can upload community logos
CREATE POLICY "Community Logo Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'communities'
);

-- events: Users can upload event images
CREATE POLICY "Event Image Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'events'
);

-- 3. Storage Policies (Allow Updates/Deletes)
CREATE POLICY "Avatar Update/Delete" ON storage.objects FOR ALL USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Voice Media Update/Delete" ON storage.objects FOR ALL USING (
  bucket_id = 'voice-media' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Public Access (Allow reading all files)
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (true);
