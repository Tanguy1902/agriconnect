export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  user_type: 'agriculteur' | 'collecteur' | 'admin';
  profile_picture?: string;
  location_region?: string;
  location_commune?: string;
  latitude?: number;
  longitude?: number;
  experience_years?: number;
  farm_description?: string;
  crop_types?: string;
  intervention_zones?: string;
  collection_capacity?: string;
  created_at: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
  image_url?: string;
}

export interface Offer {
  id: number;
  farmer_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  quality?: string;
  description?: string;
  image_url?: string;
  harvest_date?: string;
  location_region?: string;
  location_commune?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'reserved' | 'completed' | 'expired' | 'sold';
  created_at: string;
  updated_at?: string;
  farmer?: User;
  product?: Product;
}

export interface Demand {
  id: number;
  collector_id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  max_unit_price?: number;
  desired_delivery_date?: string;
  quality_required?: string;
  special_requirements?: string;
  status: 'active' | 'in_negotiation' | 'fulfilled' | 'cancelled';
  created_at: string;
  collector?: User;
  product?: Product;
}

export interface Match {
  id: number;
  offer_id: number;
  demand_id: number;
  match_score: number;
  matching_reason?: string;
  negotiated_price?: number;
  negotiated_quantity?: number;
  delivery_terms?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'completed';
  created_at: string;
  offer?: Offer;
  demand?: Demand;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  image_url?: string;
  timestamp: string;
  is_read: boolean;
  sender?: User;
  recipient?: User;
}

export interface Conversation {
  user_id: number;
  full_name: string;
  profile_picture?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'match' | 'message' | 'offer' | 'demand' | 'purchase' | 'system';
  related_id?: number;
  is_read: boolean;
  created_at: string;
}
