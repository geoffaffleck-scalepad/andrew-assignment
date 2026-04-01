"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Listing, User } from "@/types/listing";
import { login, getSellerListings, createListing } from "@/lib/api";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  image_url: "",
  size: "",
  materials: "",
  colors: "",
  style: "",
};

export default function SellPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Restore user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("seller_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("seller_user");
      }
    }
  }, []);

  // Fetch seller's listings when user is set
  useEffect(() => {
    if (!user) return;
    getSellerListings(user.id)
      .then(setMyListings)
      .catch(() => setMyListings([]));
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const u = await login(email, password);
      setUser(u);
      localStorage.setItem("seller_user", JSON.stringify(u));
    } catch {
      setLoginError("Login failed. Check your credentials.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("seller_user");
    setMyListings([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      await createListing({
        seller_id: user.id,
        title: form.title,
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        size: parseFloat(form.size),
        materials: form.materials
          ? form.materials.split(",").map((s) => s.trim())
          : [],
        colors: form.colors
          ? form.colors.split(",").map((s) => s.trim())
          : [],
        style: form.style || null,
      });
      setForm(emptyForm);
      setSuccessMsg("Listing created!");
      setTimeout(() => setSuccessMsg(""), 3000);
      // Refresh my listings
      const updated = await getSellerListings(user.id);
      setMyListings(updated);
    } catch {
      setSuccessMsg("Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full p-2 border border-gray-300 rounded text-sm";

  // Login form
  if (!user) {
    return (
      <main className="max-w-md mx-auto p-8">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Marketplace
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Seller Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button
            type="submit"
            className="py-2 bg-gray-900 text-white rounded cursor-pointer hover:bg-gray-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-400">
          Try: user1@example.com / pass1
        </p>
      </main>
    );
  }

  // Seller dashboard
  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            &larr; Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold mt-2">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm">Logged in as {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 text-sm"
        >
          Log Out
        </button>
      </div>

      {/* Create listing form */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">Create New Listing</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <input
            name="title"
            placeholder="Title *"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price *"
            value={form.price}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="size"
            type="number"
            step="0.5"
            placeholder="Size *"
            value={form.size}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="style"
            placeholder="Style (e.g. sneaker, boot)"
            value={form.style}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="image_url"
            placeholder="Image URL"
            value={form.image_url}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="materials"
            placeholder="Materials (comma-separated)"
            value={form.materials}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="colors"
            placeholder="Colors (comma-separated)"
            value={form.colors}
            onChange={handleChange}
            className={inputClass}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className={inputClass + " col-span-2"}
            rows={2}
          />
          <div className="col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gray-900 text-white rounded cursor-pointer hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Listing"}
            </button>
            {successMsg && (
              <span className="text-green-600 text-sm font-medium">
                {successMsg}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* My listings */}
      <section>
        <h2 className="text-lg font-bold mb-4">
          My Listings ({myListings.length})
        </h2>
        {myListings.length === 0 && (
          <p className="text-gray-400">No listings yet.</p>
        )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {myListings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  listing.image_url ||
                  "https://placehold.co/300x200?text=No+Image"
                }
                alt={listing.title}
                className="w-full h-[140px] object-cover rounded bg-gray-100"
              />
              <h3 className="font-semibold text-sm">{listing.title}</h3>
              <p className="font-bold">${listing.price.toFixed(2)}</p>
              {listing.style && (
                <p className="text-gray-500 text-xs">Style: {listing.style}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
