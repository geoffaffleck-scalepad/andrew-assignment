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

export interface OrderItem {
  listing_id: number;
  title: string;
  price: number;
  seller_id: string;
}

export interface Order {
  id: number;
  buyer_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_last4: string;
  shipping_name: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  created_at: string;
}
