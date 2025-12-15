-- Relay MVP Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  linkedin_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'lifetime')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_posts table
CREATE TABLE public.saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_url TEXT NOT NULL,
  post_author TEXT NOT NULL,
  post_preview TEXT,
  comment_text TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'queue' CHECK (status IN ('queue', 'scheduled', 'commented', 'skipped')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment_templates table
CREATE TABLE public.comment_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create engagement_stats table
CREATE TABLE public.engagement_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_starting DATE NOT NULL,
  comments_posted INTEGER DEFAULT 0,
  replies_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_starting)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Saved posts policies
CREATE POLICY "Users can view own posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.saved_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comment templates policies
CREATE POLICY "Users can view own templates"
  ON public.comment_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON public.comment_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.comment_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.comment_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Engagement stats policies
CREATE POLICY "Users can view own stats"
  ON public.engagement_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stats"
  ON public.engagement_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.engagement_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX saved_posts_user_id_idx ON public.saved_posts(user_id);
CREATE INDEX saved_posts_status_idx ON public.saved_posts(status);
CREATE INDEX saved_posts_scheduled_for_idx ON public.saved_posts(scheduled_for);
CREATE INDEX comment_templates_user_id_idx ON public.comment_templates(user_id);
CREATE INDEX engagement_stats_user_id_idx ON public.engagement_stats(user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.saved_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.comment_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.engagement_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
