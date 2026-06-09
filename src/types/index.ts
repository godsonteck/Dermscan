export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  skin_type?: string;          // e.g. dry, oily, combination, sensitive, normal
  skin_sensitivity?: string;   // e.g. low, medium, high
  skin_concerns?: string[];     // e.g. ["Acne", "Aging/Wrinkles", "Hyperpigmentation", "Sensitivity/Rosacea", "Eczema/Dryness", "Sun Damage"]
  age_group?: string;          // e.g. under-18, 18-25, 26-35, 36-50, 50-plus
  fitzpatrick_type?: string;   // Fitzpatrick skin phototypes Type I to VI
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
