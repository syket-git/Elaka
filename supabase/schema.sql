-- Elaka Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AREAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_area TEXT NOT NULL,
  parent_area_bn TEXT NOT NULL,
  city TEXT DEFAULT 'Chittagong',
  city_bn TEXT DEFAULT 'চট্টগ্রাম',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_areas_slug ON areas(slug);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  display_name TEXT,
  verified_area_id UUID REFERENCES areas(id),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AREA RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS area_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Safety ratings (1-5)
  safety_night INTEGER CHECK (safety_night >= 1 AND safety_night <= 5),
  safety_women INTEGER CHECK (safety_women >= 1 AND safety_women <= 5),
  theft TEXT CHECK (theft IN ('rare', 'sometimes', 'frequent')),
  police_response INTEGER CHECK (police_response >= 1 AND police_response <= 5),

  -- Infrastructure
  flooding TEXT CHECK (flooding IN ('never', 'sometimes', 'always')),
  load_shedding TEXT CHECK (load_shedding IN ('0', '1-2', '3-5', '5+')),
  water_supply TEXT CHECK (water_supply IN ('24/7', 'scheduled', 'irregular')),
  road_condition INTEGER CHECK (road_condition >= 1 AND road_condition <= 5),
  mobile_network INTEGER CHECK (mobile_network >= 1 AND mobile_network <= 5),

  -- Livability
  noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'noisy')),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  community INTEGER CHECK (community >= 1 AND community <= 5),
  parking TEXT CHECK (parking IN ('easy', 'moderate', 'difficult')),

  -- Accessibility
  transport TEXT CHECK (transport IN ('easy', 'moderate', 'difficult')),
  main_road_distance TEXT CHECK (main_road_distance IN ('walking', '5mins', '10mins', '15+mins')),
  hospital_nearby BOOLEAN,
  school_nearby BOOLEAN,
  market_distance TEXT CHECK (market_distance IN ('walking', '5mins', '10mins', '15+mins')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One rating per user per area
  UNIQUE(area_id, user_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_area_ratings_area ON area_ratings(area_id);
CREATE INDEX IF NOT EXISTS idx_area_ratings_user ON area_ratings(user_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_area ON reviews(area_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ============================================
-- AREA SCORES TABLE (Materialized/Cached)
-- ============================================
CREATE TABLE IF NOT EXISTS area_scores (
  area_id UUID PRIMARY KEY REFERENCES areas(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  safety_score INTEGER DEFAULT 0 CHECK (safety_score >= 0 AND safety_score <= 100),
  infrastructure_score INTEGER DEFAULT 0 CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
  livability_score INTEGER DEFAULT 0 CHECK (livability_score >= 0 AND livability_score <= 100),
  accessibility_score INTEGER DEFAULT 0 CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  total_ratings INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  ai_summary TEXT,
  best_for TEXT[] DEFAULT '{}',
  not_ideal_for TEXT[] DEFAULT '{}',
  good_things TEXT[] DEFAULT '{}',
  problems TEXT[] DEFAULT '{}',
  alerts TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_scores ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Areas: Everyone can view
CREATE POLICY "Areas are viewable by everyone" ON areas
  FOR SELECT USING (true);

-- Area Scores: Everyone can view
CREATE POLICY "Area scores are viewable by everyone" ON area_scores
  FOR SELECT USING (true);

-- Ratings: Users can view all, but only create/update their own
CREATE POLICY "Ratings are viewable by everyone" ON area_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON area_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON area_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Everyone can view approved, users manage their own
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update area scores (call this after new ratings)
CREATE OR REPLACE FUNCTION update_area_scores(p_area_id UUID)
RETURNS VOID AS $$
DECLARE
  v_safety_score INTEGER;
  v_infrastructure_score INTEGER;
  v_livability_score INTEGER;
  v_accessibility_score INTEGER;
  v_overall_score INTEGER;
  v_total_ratings INTEGER;
  v_total_reviews INTEGER;
BEGIN
  -- Calculate safety score
  SELECT
    COALESCE(AVG(
      (COALESCE(safety_night, 3) + COALESCE(safety_women, 3) + COALESCE(police_response, 3)) / 3.0 * 20
    )::INTEGER, 50)
  INTO v_safety_score
  FROM area_ratings WHERE area_id = p_area_id;

  -- Calculate infrastructure score
  SELECT
    COALESCE(AVG(
      (COALESCE(road_condition, 3) + COALESCE(mobile_network, 3)) / 2.0 * 20
    )::INTEGER, 50)
  INTO v_infrastructure_score
  FROM area_ratings WHERE area_id = p_area_id;

  -- Calculate livability score
  SELECT
    COALESCE(AVG(
      (COALESCE(cleanliness, 3) + COALESCE(community, 3)) / 2.0 * 20
    )::INTEGER, 50)
  INTO v_livability_score
  FROM area_ratings WHERE area_id = p_area_id;

  -- Calculate accessibility score (simplified)
  SELECT COALESCE(70, 50) INTO v_accessibility_score;

  -- Calculate overall score
  v_overall_score := (v_safety_score + v_infrastructure_score + v_livability_score + v_accessibility_score) / 4;

  -- Count ratings and reviews
  SELECT COUNT(*) INTO v_total_ratings FROM area_ratings WHERE area_id = p_area_id;
  SELECT COUNT(*) INTO v_total_reviews FROM reviews WHERE area_id = p_area_id AND is_approved = true;

  -- Upsert area scores
  INSERT INTO area_scores (
    area_id, overall_score, safety_score, infrastructure_score,
    livability_score, accessibility_score, total_ratings, total_reviews, updated_at
  ) VALUES (
    p_area_id, v_overall_score, v_safety_score, v_infrastructure_score,
    v_livability_score, v_accessibility_score, v_total_ratings, v_total_reviews, NOW()
  )
  ON CONFLICT (area_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    safety_score = EXCLUDED.safety_score,
    infrastructure_score = EXCLUDED.infrastructure_score,
    livability_score = EXCLUDED.livability_score,
    accessibility_score = EXCLUDED.accessibility_score,
    total_ratings = EXCLUDED.total_ratings,
    total_reviews = EXCLUDED.total_reviews,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update scores when rating is added/updated
CREATE OR REPLACE FUNCTION trigger_update_area_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_area_scores(NEW.area_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_rating_change ON area_ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON area_ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_area_scores();

-- ============================================
-- SEED DATA (Chittagong Areas)
-- ============================================

-- Insert areas
INSERT INTO areas (name, name_bn, slug, parent_area, parent_area_bn) VALUES
('Agrabad Access Road', 'আগ্রাবাদ এক্সেস রোড', 'agrabad-access-road', 'Agrabad', 'আগ্রাবাদ'),
('Nasirabad Housing', 'নাসিরাবাদ হাউজিং', 'nasirabad-housing', 'Nasirabad', 'নাসিরাবাদ'),
('Halishahar A Block', 'হালিশহর এ ব্লক', 'halishahar-a-block', 'Halishahar', 'হালিশহর'),
('GEC Circle', 'জিইসি সার্কেল', 'gec-circle', 'GEC', 'জিইসি'),
('Khulshi', 'খুলশী', 'khulshi', 'Khulshi', 'খুলশী'),
('Panchlaish', 'পাঁচলাইশ', 'panchlaish', 'Panchlaish', 'পাঁচলাইশ'),
('Muradpur', 'মুরাদপুর', 'muradpur', 'Muradpur', 'মুরাদপুর'),
('Oxygen', 'অক্সিজেন', 'oxygen', 'Oxygen', 'অক্সিজেন'),
('Sholoshahar', 'ষোলশহর', 'sholoshahar', 'Sholoshahar', 'ষোলশহর'),
('Chandgaon', 'চাঁদগাঁও', 'chandgaon', 'Chandgaon', 'চাঁদগাঁও')
ON CONFLICT (slug) DO NOTHING;

-- Insert initial scores for areas
INSERT INTO area_scores (area_id, overall_score, safety_score, infrastructure_score, livability_score, accessibility_score, total_ratings, total_reviews, ai_summary, best_for, not_ideal_for, good_things, problems, alerts)
SELECT
  id,
  CASE slug
    WHEN 'agrabad-access-road' THEN 72
    WHEN 'nasirabad-housing' THEN 85
    WHEN 'halishahar-a-block' THEN 68
    WHEN 'gec-circle' THEN 78
    WHEN 'khulshi' THEN 82
    WHEN 'panchlaish' THEN 76
    WHEN 'muradpur' THEN 70
    WHEN 'oxygen' THEN 65
    WHEN 'sholoshahar' THEN 80
    WHEN 'chandgaon' THEN 67
    ELSE 70
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN 68
    WHEN 'nasirabad-housing' THEN 88
    WHEN 'halishahar-a-block' THEN 72
    WHEN 'gec-circle' THEN 75
    WHEN 'khulshi' THEN 85
    WHEN 'panchlaish' THEN 78
    WHEN 'muradpur' THEN 72
    WHEN 'oxygen' THEN 62
    WHEN 'sholoshahar' THEN 82
    WHEN 'chandgaon' THEN 68
    ELSE 70
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN 65
    WHEN 'nasirabad-housing' THEN 82
    WHEN 'halishahar-a-block' THEN 58
    WHEN 'gec-circle' THEN 80
    WHEN 'khulshi' THEN 78
    WHEN 'panchlaish' THEN 72
    WHEN 'muradpur' THEN 68
    WHEN 'oxygen' THEN 60
    WHEN 'sholoshahar' THEN 78
    WHEN 'chandgaon' THEN 62
    ELSE 65
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN 70
    WHEN 'nasirabad-housing' THEN 90
    WHEN 'halishahar-a-block' THEN 70
    WHEN 'gec-circle' THEN 72
    WHEN 'khulshi' THEN 88
    WHEN 'panchlaish' THEN 80
    WHEN 'muradpur' THEN 68
    WHEN 'oxygen' THEN 65
    WHEN 'sholoshahar' THEN 82
    WHEN 'chandgaon' THEN 70
    ELSE 70
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN 85
    WHEN 'nasirabad-housing' THEN 80
    WHEN 'halishahar-a-block' THEN 72
    WHEN 'gec-circle' THEN 85
    WHEN 'khulshi' THEN 77
    WHEN 'panchlaish' THEN 74
    WHEN 'muradpur' THEN 72
    WHEN 'oxygen' THEN 73
    WHEN 'sholoshahar' THEN 78
    WHEN 'chandgaon' THEN 68
    ELSE 75
  END,
  FLOOR(RANDOM() * 50 + 20)::INTEGER,
  FLOOR(RANDOM() * 20 + 5)::INTEGER,
  CASE slug
    WHEN 'nasirabad-housing' THEN 'নাসিরাবাদ হাউজিং চট্টগ্রামের অন্যতম সেরা আবাসিক এলাকা। শান্ত পরিবেশ, ভালো স্কুল এবং নিরাপদ রাস্তা এই এলাকার বৈশিষ্ট্য।'
    WHEN 'khulshi' THEN 'খুলশী চট্টগ্রামের প্রিমিয়াম আবাসিক এলাকাগুলোর একটি। পাহাড়ি পরিবেশ, সবুজ প্রকৃতি এবং নিরাপদ পরিবেশ।'
    ELSE 'এই এলাকা সম্পর্কে বিস্তারিত তথ্য শীঘ্রই আসছে।'
  END,
  CASE slug
    WHEN 'nasirabad-housing' THEN ARRAY['পরিবার', 'শিশুদের জন্য', 'বয়স্ক মানুষ']
    WHEN 'khulshi' THEN ARRAY['পরিবার', 'প্রকৃতিপ্রেমী']
    ELSE ARRAY['সবার জন্য']
  END,
  CASE slug
    WHEN 'nasirabad-housing' THEN ARRAY['কম বাজেটে থাকতে চান যারা']
    WHEN 'oxygen' THEN ARRAY['পরিবার', 'নারী একা থাকলে']
    ELSE ARRAY[]::TEXT[]
  END,
  CASE slug
    WHEN 'nasirabad-housing' THEN ARRAY['খুব নিরাপদ', 'ভালো স্কুল কাছে', 'শান্ত পরিবেশ']
    WHEN 'agrabad-access-road' THEN ARRAY['সিএনজি সহজলভ্য', 'হাসপাতাল কাছে', 'বাজার কাছে']
    ELSE ARRAY['ভালো এলাকা']
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN ARRAY['রাস্তায় যানজট', 'শব্দ দূষণ বেশি']
    WHEN 'halishahar-a-block' THEN ARRAY['জলাবদ্ধতা সমস্যা', 'রাস্তা ভাঙা']
    ELSE ARRAY[]::TEXT[]
  END,
  CASE slug
    WHEN 'agrabad-access-road' THEN ARRAY['বর্ষায় জলাবদ্ধতা', 'দৈনিক ২-৩ ঘন্টা লোডশেডিং']
    WHEN 'halishahar-a-block' THEN ARRAY['বর্ষায় তীব্র জলাবদ্ধতা']
    ELSE ARRAY[]::TEXT[]
  END
FROM areas
ON CONFLICT (area_id) DO NOTHING;
