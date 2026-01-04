import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { area_slug, ratings, review, user_id } = body;

    if (!area_slug || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get area ID from slug
    const { data: area, error: areaError } = await supabase
      .from('areas')
      .select('id')
      .eq('slug', area_slug)
      .single();

    if (areaError || !area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    // Prepare rating data
    const ratingData = {
      area_id: area.id,
      user_id,
      // Safety
      safety_night: ratings.safety_night || null,
      safety_women: ratings.safety_women || null,
      theft: ratings.theft || null,
      police_response: ratings.police_response || null,
      // Infrastructure
      flooding: ratings.flooding || null,
      load_shedding: ratings.load_shedding || null,
      water_supply: ratings.water_supply || null,
      road_condition: ratings.road_condition || null,
      mobile_network: ratings.mobile_network || null,
      // Livability
      noise_level: ratings.noise_level || null,
      cleanliness: ratings.cleanliness || null,
      community: ratings.community || null,
      parking: ratings.parking || null,
      // Accessibility
      transport: ratings.transport || null,
      main_road_distance: ratings.main_road_distance || null,
      hospital_nearby: ratings.hospital_nearby === 'yes',
      school_nearby: ratings.school_nearby === 'yes',
      market_distance: ratings.market_distance || null,
    };

    // Upsert rating (update if exists, insert if not)
    const { error: ratingError } = await supabase
      .from('area_ratings')
      .upsert(ratingData, {
        onConflict: 'area_id,user_id',
      });

    if (ratingError) {
      console.error('Rating error:', ratingError);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    // If review is provided, save it
    if (review && review.trim()) {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          area_id: area.id,
          user_id,
          content: review.trim(),
        });

      if (reviewError) {
        console.error('Review error:', reviewError);
        // Don't fail the whole request if review fails
      }
    }

    // Update area scores
    await supabase.rpc('update_area_scores', { p_area_id: area.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get reviews for an area
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaSlug = searchParams.get('area_slug');

    if (!areaSlug) {
      return NextResponse.json(
        { error: 'Missing area_slug parameter' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get area ID from slug - use maybeSingle to handle not found gracefully
    const { data: area } = await supabase
      .from('areas')
      .select('id')
      .eq('slug', areaSlug)
      .maybeSingle();

    // If area doesn't exist in DB (using seed data), return empty reviews
    if (!area) {
      return NextResponse.json({ reviews: [] });
    }

    // Get reviews first
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('id, content, created_at, user_id')
      .eq('area_id', area.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (reviewError) {
      console.error('Review fetch error:', reviewError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Fetch profiles for each review's user
    const reviewsWithProfiles = await Promise.all(
      (reviews || []).map(async (review) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, is_verified')
          .eq('id', review.user_id)
          .maybeSingle();

        return {
          ...review,
          profiles: profile || { display_name: null, is_verified: false },
        };
      })
    );

    return NextResponse.json({ reviews: reviewsWithProfiles });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
