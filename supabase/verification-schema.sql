-- Run this in Supabase SQL Editor to add verification tables
-- Location-based verification: 3 check-ins over 7 days

-- ============================================
-- ADD GEO BOUNDARIES TO AREAS
-- ============================================
ALTER TABLE areas ADD COLUMN IF NOT EXISTS center_lat DECIMAL(10, 8);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS center_lng DECIMAL(11, 8);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 1500; -- 1.5km default radius

-- Update Chittagong area coordinates
UPDATE areas SET
  center_lat = 22.3266,
  center_lng = 91.8125,
  radius_meters = 1200
WHERE slug = 'agrabad-access-road';

UPDATE areas SET
  center_lat = 22.3672,
  center_lng = 91.8227,
  radius_meters = 1500
WHERE slug = 'nasirabad-housing';

UPDATE areas SET
  center_lat = 22.3398,
  center_lng = 91.7912,
  radius_meters = 1800
WHERE slug = 'halishahar-a-block';

UPDATE areas SET
  center_lat = 22.3590,
  center_lng = 91.8310,
  radius_meters = 1000
WHERE slug = 'gec-circle';

UPDATE areas SET
  center_lat = 22.3560,
  center_lng = 91.8180,
  radius_meters = 1200
WHERE slug = 'khulshi';

UPDATE areas SET
  center_lat = 22.3630,
  center_lng = 91.8280,
  radius_meters = 1200
WHERE slug = 'panchlaish';

UPDATE areas SET
  center_lat = 22.3500,
  center_lng = 91.8350,
  radius_meters = 1000
WHERE slug = 'muradpur';

UPDATE areas SET
  center_lat = 22.3720,
  center_lng = 91.8150,
  radius_meters = 1500
WHERE slug = 'oxygen';

UPDATE areas SET
  center_lat = 22.3750,
  center_lng = 91.8320,
  radius_meters = 1500
WHERE slug = 'sholoshahar';

UPDATE areas SET
  center_lat = 22.3680,
  center_lng = 91.8480,
  radius_meters = 1800
WHERE slug = 'chandgaon';

-- ============================================
-- VERIFICATION CHECK-INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_meters INTEGER, -- distance from area center
  is_valid BOOLEAN DEFAULT FALSE, -- within radius
  checkin_date DATE DEFAULT CURRENT_DATE, -- date only for uniqueness
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent multiple check-ins on same day (using unique index instead of constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_checkins_unique_daily
  ON verification_checkins(user_id, area_id, checkin_date);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_checkins_user ON verification_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_checkins_area ON verification_checkins(area_id);

-- ============================================
-- ADD VERIFICATION FIELDS TO PROFILES
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_area_id UUID REFERENCES areas(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('location', 'document'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE verification_checkins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view own checkins" ON verification_checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own check-ins
CREATE POLICY "Users can insert own checkins" ON verification_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_meters(
  lat1 DECIMAL, lng1 DECIMAL,
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS INTEGER AS $$
DECLARE
  R INTEGER := 6371000; -- Earth's radius in meters
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN (R * c)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check-in and validate location
CREATE OR REPLACE FUNCTION checkin_for_verification(
  p_area_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_area RECORD;
  v_distance INTEGER;
  v_is_valid BOOLEAN;
  v_checkin_count INTEGER;
  v_days_span INTEGER;
  v_existing_checkin BOOLEAN;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get area details
  SELECT * INTO v_area FROM areas WHERE id = p_area_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Area not found');
  END IF;

  -- Check if already checked in today
  SELECT EXISTS(
    SELECT 1 FROM verification_checkins
    WHERE user_id = v_user_id
    AND area_id = p_area_id
    AND checkin_date = CURRENT_DATE
  ) INTO v_existing_checkin;

  IF v_existing_checkin THEN
    RETURN json_build_object('success', false, 'error', 'Already checked in today');
  END IF;

  -- Calculate distance from area center
  v_distance := calculate_distance_meters(
    p_latitude, p_longitude,
    v_area.center_lat, v_area.center_lng
  );

  -- Check if within radius
  v_is_valid := v_distance <= v_area.radius_meters;

  -- Insert check-in
  INSERT INTO verification_checkins (user_id, area_id, latitude, longitude, distance_meters, is_valid)
  VALUES (v_user_id, p_area_id, p_latitude, p_longitude, v_distance, v_is_valid);

  -- Update profile verification_area_id if first check-in
  UPDATE profiles
  SET verification_area_id = p_area_id,
      verification_method = 'location',
      verification_started_at = COALESCE(verification_started_at, NOW())
  WHERE id = v_user_id AND (verification_area_id IS NULL OR verification_area_id = p_area_id);

  -- Count valid check-ins for this area
  SELECT COUNT(*),
         COALESCE(MAX(created_at::DATE) - MIN(created_at::DATE), 0)
  INTO v_checkin_count, v_days_span
  FROM verification_checkins
  WHERE user_id = v_user_id
  AND area_id = p_area_id
  AND is_valid = true;

  -- Check if verification complete (3 valid check-ins over at least 7 days)
  IF v_checkin_count >= 3 AND v_days_span >= 7 THEN
    UPDATE profiles
    SET is_verified = true,
        verified_area_id = p_area_id,
        verified_at = NOW()
    WHERE id = v_user_id;

    RETURN json_build_object(
      'success', true,
      'is_valid', v_is_valid,
      'distance', v_distance,
      'checkin_count', v_checkin_count,
      'days_span', v_days_span,
      'verified', true,
      'message', 'Verification complete!'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'is_valid', v_is_valid,
    'distance', v_distance,
    'checkin_count', v_checkin_count,
    'days_span', v_days_span,
    'verified', false,
    'remaining_checkins', 3 - v_checkin_count,
    'remaining_days', GREATEST(0, 7 - v_days_span)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get verification status
CREATE OR REPLACE FUNCTION get_verification_status(p_area_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_checkin_count INTEGER;
  v_valid_count INTEGER;
  v_days_span INTEGER;
  v_first_checkin TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('authenticated', false);
  END IF;

  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;

  -- If already verified
  IF v_profile.is_verified THEN
    RETURN json_build_object(
      'authenticated', true,
      'is_verified', true,
      'verified_area_id', v_profile.verified_area_id,
      'verified_at', v_profile.verified_at
    );
  END IF;

  -- Get check-in stats for the area (use provided or profile's verification area)
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_valid),
    COALESCE(MAX(created_at::DATE) - MIN(created_at::DATE), 0),
    MIN(created_at)
  INTO v_checkin_count, v_valid_count, v_days_span, v_first_checkin
  FROM verification_checkins
  WHERE user_id = v_user_id
  AND area_id = COALESCE(p_area_id, v_profile.verification_area_id);

  RETURN json_build_object(
    'authenticated', true,
    'is_verified', false,
    'verification_area_id', v_profile.verification_area_id,
    'verification_started_at', v_profile.verification_started_at,
    'total_checkins', v_checkin_count,
    'valid_checkins', v_valid_count,
    'days_span', v_days_span,
    'first_checkin', v_first_checkin,
    'remaining_checkins', GREATEST(0, 3 - v_valid_count),
    'remaining_days', GREATEST(0, 7 - v_days_span)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
