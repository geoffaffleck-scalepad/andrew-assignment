"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Listing } from "@/types/listing";
import { getListings } from "@/lib/api";

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cart, setCart] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutDone, setCheckoutDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    getListings(search || undefined)
      .then(setListings)
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
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shoe Marketplace</h1>
        <Link
          href="/sell"
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
        >
          Seller Portal
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search shoes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border border-gray-300 rounded text-base"
      />

      <div className="flex gap-8">
        {/* Listings grid */}
        <section className="flex-[3]">
          {loading && <p className="text-gray-500">Loading...</p>}
          {!loading && listings.length === 0 && (
            <p className="text-gray-400">No listings found.</p>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    listing.image_url ||
                    "https://placehold.co/300x200?text=No+Image"
                  }
                  alt={listing.title}
                  className="w-full h-[180px] object-cover rounded bg-gray-100"
                />
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="font-bold text-lg">
                  ${listing.price.toFixed(2)}
                </p>
                {listing.style && (
                  <p className="text-gray-500 text-sm">
                    Style: {listing.style}
                  </p>
                )}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => addToCart(listing)}
                    className="flex-1 py-2 bg-gray-900 text-white rounded cursor-pointer hover:bg-gray-700"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="flex-1 py-2 text-center border border-gray-900 rounded hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart sidebar */}
        <aside className="flex-1 border-l border-gray-200 pl-6 min-w-[250px]">
          <h2 className="text-xl font-bold mb-4">Cart ({cart.length})</h2>

          {cart.length === 0 && !checkoutDone && (
            <p className="text-gray-400">Your cart is empty.</p>
          )}

          {cart.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div>
                <p className="text-sm">{item.title}</p>
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(i)}
                className="text-red-600 text-sm cursor-pointer hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <div className="mt-4">
              <p className="font-bold mb-2">Total: ${total}</p>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gray-900 text-white rounded cursor-pointer text-base hover:bg-gray-700"
              >
                Checkout
              </button>
            </div>
          )}

          {checkoutDone && (
            <p className="mt-4 text-green-600 font-bold">
              Order placed successfully!
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
