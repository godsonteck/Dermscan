export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Product {
  name: string;
  brand: string;
  type: string;
  emoji: string;
  description: string;
  key_ingredients: string[];
  price_range: string;
  how_to_use: string;
}

export interface Scan {
  id: number;
  user_id: number;
  image_path: string | null;
  body_part: string | null;
  duration: string | null;
  skin_type: string | null;
  symptoms: string[];
  condition: string;
  confidence: string;
  severity: string;
  description: string;
  causes: string[];
  risk_factors: string;
  when_to_see_doctor: string;
  products: Product[];
  immediate_steps: string[];
  daily_routine: string[];
  avoid: string[];
  disclaimer: string;
  created_at: string;
  is_valid_skin_image?: boolean;
}

export interface ScanListItem {
  id: number;
  condition: string;
  confidence: string;
  severity: string;
  image_path: string | null;
  body_part: string | null;
  skin_type: string | null;
  symptoms: string[];
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ProfileStats {
  user: User;
  total_scans: number;
  last_scan_date: string | null;
  most_common_condition: string | null;
}
