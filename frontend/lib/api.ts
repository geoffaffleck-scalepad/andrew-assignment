import { Listing, User } from "@/types/listing";

const API = "http://localhost:8000";

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
  payload: Omit<Listing, "id" | "created_at">
): Promise<Listing> {
  const res = await fetch(`${API}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}
