-- Community Chat Tables

-- 1. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  links TEXT[], -- Array of links if needed, or just part of content
  is_announcement BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Community Post Comments
CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Community Permission Requests (Sorum Var!)
CREATE TABLE IF NOT EXISTS public.community_permission_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add settings to communities table
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS is_chat_public BOOLEAN DEFAULT false;


-- RLS POLICIES

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_permission_requests ENABLE ROW LEVEL SECURITY;

-- Posts Policies
DROP POLICY IF EXISTS "Posts viewable by everyone if public or follower" ON public.community_posts;
CREATE POLICY "Posts viewable by everyone if public or follower"
  ON public.community_posts FOR SELECT
  USING (
    auth.uid() = user_id OR -- Authors can always see their own posts
    EXISTS (
      SELECT 1 FROM public.communities c
      LEFT JOIN public.community_followers cf ON cf.community_id = c.id AND cf.user_id = auth.uid()
      WHERE c.id = community_posts.community_id
      AND (c.is_chat_public = true OR cf.user_id IS NOT NULL OR c.admin_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can insert posts" ON public.community_posts;
CREATE POLICY "Admins can insert posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users with approved request can insert posts" ON public.community_posts;
CREATE POLICY "Users with approved request can insert posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
     EXISTS (
        SELECT 1 FROM public.community_permission_requests 
        WHERE user_id = auth.uid() AND community_id = community_posts.community_id AND status = 'approved'
     )
  );

DROP POLICY IF EXISTS "Authors and Admins can delete posts" ON public.community_posts;
CREATE POLICY "Authors and Admins can delete posts"
  ON public.community_posts FOR DELETE
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid())
  );

-- Comments Policies
DROP POLICY IF EXISTS "Comments viewable by viewers of posts" ON public.community_post_comments;
CREATE POLICY "Comments viewable by viewers of posts"
  ON public.community_post_comments FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM public.community_posts p
        WHERE p.id = post_id
    )
  );

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.community_post_comments;
CREATE POLICY "Authenticated users can comment"
  ON public.community_post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and Admins can delete comments" ON public.community_post_comments;
CREATE POLICY "Authors and Admins can delete comments"
  ON public.community_post_comments FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.community_posts p
      JOIN public.communities c ON c.id = p.community_id
      WHERE p.id = post_id AND c.admin_id = auth.uid()
  ));


-- Permission Requests Policies
DROP POLICY IF EXISTS "Users can see their own requests" ON public.community_permission_requests;
CREATE POLICY "Users can see their own requests"
  ON public.community_permission_requests FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create requests" ON public.community_permission_requests;
CREATE POLICY "Users can create requests"
  ON public.community_permission_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update requests" ON public.community_permission_requests;
CREATE POLICY "Admins can update requests"
  ON public.community_permission_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND admin_id = auth.uid())
  );
  -- Note: We also need to allow the system/trigger to update it to 'used', or the user themselves if we do it via client (not recommended).
  -- Better: Logic in Server Action with Service Role or strict RLS. 
  -- For MVP, let's allow Admins to update. We will handle 'used' status via Server Action with Service Role probably.


-- When a post is inserted by a non-admin, find the approved request and mark it used.
CREATE OR REPLACE FUNCTION mark_request_as_used()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (SELECT 1 FROM public.communities WHERE id = NEW.community_id AND admin_id = NEW.user_id) INTO is_admin;
  
  IF NOT is_admin THEN
    -- Find and update the request
    UPDATE public.community_permission_requests
    SET status = 'used'
    WHERE user_id = NEW.user_id 
    AND community_id = NEW.community_id 
    AND status = 'approved'
    AND id = (
        SELECT id FROM public.community_permission_requests 
        WHERE user_id = NEW.user_id 
        AND community_id = NEW.community_id 
        AND status = 'approved' 
        ORDER BY created_at DESC 
        LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_request_used ON public.community_posts;
CREATE TRIGGER trigger_mark_request_used
AFTER INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION mark_request_as_used();

