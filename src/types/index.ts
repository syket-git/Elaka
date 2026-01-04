export interface Area {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  parent_area: string;
  parent_area_bn: string;
  city: string;
  city_bn: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface AreaScore {
  area_id: string;
  overall_score: number;
  safety_score: number;
  infrastructure_score: number;
  livability_score: number;
  accessibility_score: number;
  total_ratings: number;
  total_reviews: number;
  updated_at: string;
}

export interface AreaRating {
  id: string;
  area_id: string;
  user_id: string;
  // Safety
  safety_night: number; // 1-5
  safety_women: number; // 1-5
  theft: 'rare' | 'sometimes' | 'frequent';
  police_response: number; // 1-5
  // Infrastructure
  flooding: 'never' | 'sometimes' | 'always';
  load_shedding: '0' | '1-2' | '3-5' | '5+';
  water_supply: '24/7' | 'scheduled' | 'irregular';
  road_condition: number; // 1-5
  mobile_network: number; // 1-5
  // Livability
  noise_level: 'quiet' | 'moderate' | 'noisy';
  cleanliness: number; // 1-5
  community: number; // 1-5
  parking: 'easy' | 'moderate' | 'difficult';
  // Accessibility
  transport: 'easy' | 'moderate' | 'difficult';
  main_road_distance: 'walking' | '5mins' | '10mins' | '15+mins';
  hospital_nearby: boolean;
  school_nearby: boolean;
  market_distance: 'walking' | '5mins' | '10mins' | '15+mins';
  created_at: string;
}

export interface Review {
  id: string;
  area_id: string;
  user_id: string;
  content: string;
  pros: string[];
  cons: string[];
  created_at: string;
  user?: {
    display_name?: string;
    is_verified: boolean;
  };
}

export interface AreaWithScore extends Area {
  scores: AreaScore;
  ai_summary?: string;
  best_for?: string[];
  not_ideal_for?: string[];
  alerts?: string[];
  good_things?: string[];
  problems?: string[];
}

export interface User {
  id: string;
  phone: string;
  display_name?: string;
  verified_area_id?: string;
  is_verified: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
