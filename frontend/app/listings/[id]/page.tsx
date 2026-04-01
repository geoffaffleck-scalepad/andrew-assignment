"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Listing } from "@/types/listing";
import { getListing } from "@/lib/api";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getListing(id)
      .then(setListing)
      .catch(() => setError("Listing not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!listing) return;
    const cart: Listing[] = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
    cart.push(listing);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Marketplace
        </Link>
        <p className="mt-4 text-red-600">{error || "Listing not found."}</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline text-sm">
        &larr; Back to Marketplace
      </Link>

      <div className="mt-6 flex gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            listing.image_url ||
            "https://placehold.co/400x300?text=No+Image"
          }
          alt={listing.title}
          className="w-[400px] h-[300px] object-cover rounded-lg bg-gray-100"
        />

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-2xl font-bold">${listing.price.toFixed(2)}</p>

          {listing.description && (
            <p className="text-gray-600">{listing.description}</p>
          )}

          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>Size: {listing.size}</p>
            {listing.style && <p>Style: {listing.style}</p>}
            {listing.materials.length > 0 && (
              <p>Materials: {listing.materials.join(", ")}</p>
            )}
            {listing.colors.length > 0 && (
              <p>Colors: {listing.colors.join(", ")}</p>
            )}
          </div>

          <button
            onClick={addToCart}
            className="mt-4 px-6 py-3 bg-gray-900 text-white rounded cursor-pointer hover:bg-gray-700 w-fit"
          >
            Add to Cart
          </button>

          {added && (
            <p className="text-green-600 text-sm font-medium">
              Added to cart!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
