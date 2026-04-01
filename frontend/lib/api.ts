import { Listing, Order, OrderItem, User } from "@/types/listing";

const API = "http://localhost:8000";
type ListingPayload = Omit<Listing, "id" | "created_at">;

async function getApiErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item: { msg?: string }) => item?.msg)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getListings(search?: string): Promise<Listing[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API}/listings${params}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function getListing(id: string): Promise<Listing> {
  const res = await fetch(`${API}/listings/${id}`);
  if (!res.ok) throw new Error("Listing not found");
  return res.json();
}

export async function getSellerListings(sellerId: string): Promise<Listing[]> {
  const res = await fetch(`${API}/sellers/${sellerId}/listings`);
  if (!res.ok) throw new Error("Failed to fetch seller listings");
  return res.json();
}

export async function createListing(
  payload: ListingPayload
): Promise<Listing> {
  const res = await fetch(`${API}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}

export async function updateListing(
  id: number,
  payload: ListingPayload
): Promise<Listing> {
  const res = await fetch(`${API}/listings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update listing");
  return res.json();
}

export async function deleteListing(
  id: number,
  sellerId: string
): Promise<void> {
  const res = await fetch(
    `${API}/listings/${id}?seller_id=${encodeURIComponent(sellerId)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete listing");
}

export async function createOrder(payload: {
  buyer_id: string;
  items: OrderItem[];
  card_number: string;
  shipping_name: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}): Promise<Order> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      await getApiErrorMessage(res, "Checkout failed. Please verify your details.")
    );
  }
  return res.json();
}

export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  const res = await fetch(`${API}/buyers/${buyerId}/orders`);
  if (!res.ok) throw new Error("Failed to fetch buyer orders");
  return res.json();
}
