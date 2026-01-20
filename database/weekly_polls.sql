-- =====================
-- WEEKLY POLLS TABLE
-- =====================
-- This table caches AI-generated polls for each week to avoid redundant API calls
-- and ensure consistent experience across students.

CREATE TABLE IF NOT EXISTS public.weekly_polls (
  week_id TEXT PRIMARY KEY, -- Format: YYYY-WW (e.g. 2024-W01) or YYYY-WW-uni (e.g. 2024-W01-metu)
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.weekly_polls ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Weekly polls are viewable by everyone"
  ON public.weekly_polls FOR SELECT
  USING (true);

-- =====================
-- POLL VOTES TABLE
-- =====================
-- Tracks user participation in weekly polls

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id TEXT NOT NULL, -- Maps to weekly_polls.week_id
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
