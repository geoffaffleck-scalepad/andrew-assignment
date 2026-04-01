export interface Listing {
  id: number;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  size: number;
  materials: string[];
  colors: string[];
  style: string | null;
  seller_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}
