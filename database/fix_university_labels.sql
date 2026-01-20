-- Fix University Labels in Profiles Table
-- This script corrects university assignments based on email domains from auth.users

-- Step 1: Update users with Bilkent email domains to university = 'bilkent'
UPDATE public.profiles
SET university = 'bilkent'
WHERE id IN (
    SELECT au.id
    FROM auth.users au
    WHERE au.email LIKE '%@bilkent.edu.tr'
       OR au.email LIKE '%@ug.bilkent.edu.tr'
);

-- Step 2: Update users with METU email domains to university = 'metu'
UPDATE public.profiles
SET university = 'metu'
WHERE id IN (
    SELECT au.id
    FROM auth.users au
    WHERE au.email LIKE '%@metu.edu.tr'
       OR au.email LIKE 'e%@metu.edu.tr'
);

-- Step 3: For users with NULL university and no clear email domain, 
-- default to 'metu' if their student_id matches METU patterns (e123456)
UPDATE public.profiles
SET university = 'metu'
WHERE university IS NULL
  AND student_id ~ '^e[0-9]+$';

-- Verification Query (run separately to check results):
-- SELECT university, COUNT(*) FROM public.profiles GROUP BY university;
