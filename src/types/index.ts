export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface CarbonFootprint {
  id: string;
  user_id: string;
  transport_mode: 'car' | 'bus' | 'train' | 'plane';
  miles: number;
  emissions: number;
  date: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface PoolingRequest {
  id: string;
  user_id: string;
  source: {
    lat: number;
    lng: number;
    name: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
  };
  date: string;
  time: string;
  seats_available: number;
  user: User;
}