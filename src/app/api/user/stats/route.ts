import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile with verification status
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        is_verified,
        verified_area_id,
        display_name,
        areas:verified_area_id (
          name,
          name_bn
        )
      `)
      .eq('id', userId)
      .single();

    // Count user's ratings
    const { count: ratingsCount } = await supabase
      .from('area_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count user's reviews
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's reviews with area info
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        created_at,
        areas (
          id,
          name,
          name_bn,
          slug
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's rated areas
    const { data: ratings } = await supabase
      .from('area_ratings')
      .select(`
        id,
        created_at,
        areas (
          id,
          name,
          name_bn,
          slug
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        ratings_count: ratingsCount || 0,
        reviews_count: reviewsCount || 0,
        is_verified: profile?.is_verified || false,
        verified_area: profile?.areas || null,
      },
      reviews: reviews || [],
      ratings: ratings || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
