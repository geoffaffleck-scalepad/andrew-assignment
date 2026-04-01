"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Listing {
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

const API = "http://localhost:8000";

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "4px",
  background: "#f0f0f0",
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cart, setCart] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutDone, setCheckoutDone] = useState(false);

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    setLoading(true);
    fetch(`${API}/listings${params}`)
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [search]);

  const addToCart = (listing: Listing) => {
    setCart((prev) => [...prev, listing]);
    setCheckoutDone(false);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    setCart([]);
    setCheckoutDone(true);
    setTimeout(() => setCheckoutDone(false), 3000);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Shoe Marketplace</h1>

      <input
        type="text"
        placeholder="Search shoes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1rem",
        }}
      />

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Listings grid */}
        <section style={{ flex: 3 }}>
          {loading && <p>Loading...</p>}
          {!loading && listings.length === 0 && (
            <p style={{ color: "#888" }}>No listings found.</p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {listings.map((listing) => (
              <div key={listing.id} style={cardStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.image_url || "https://placehold.co/300x200?text=No+Image"}
                  alt={listing.title}
                  style={imgStyle}
                />
                <h3>{listing.title}</h3>
                <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  ${listing.price.toFixed(2)}
                </p>
                {listing.style && (
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Style: {listing.style}
                  </p>
                )}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <button
                    onClick={() => addToCart(listing)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/listings/${listing.id}`}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      textAlign: "center",
                      border: "1px solid #111",
                      borderRadius: "4px",
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart sidebar */}
        <aside
          style={{
            flex: 1,
            borderLeft: "1px solid #ddd",
            paddingLeft: "1.5rem",
            minWidth: "250px",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Cart ({cart.length})</h2>

          {cart.length === 0 && !checkoutDone && (
            <p style={{ color: "#888" }}>Your cart is empty.</p>
          )}

          {cart.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <p style={{ fontSize: "0.9rem" }}>{item.title}</p>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#c00",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                Total: ${total}
              </p>
              <button
                onClick={handleCheckout}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Checkout
              </button>
            </div>
          )}

          {checkoutDone && (
            <p
              style={{
                marginTop: "1rem",
                color: "green",
                fontWeight: "bold",
              }}
            >
              Order placed successfully!
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
