-- Surgical fix for Salih Kızıler's accidental Bilkent account
-- This will delete the account from auth.users, which cascades to public.profiles

-- 1. Identify and delete the user
-- Based on user report: "e277326" numaralı bilkentli
DELETE FROM auth.users 
WHERE email = 'e277326@bilkent.edu.tr';

-- 2. Verify deletion (optional for manual check)
-- SELECT * FROM public.profiles WHERE student_id = 'e277326';
