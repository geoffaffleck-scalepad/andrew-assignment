"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Listing, User } from "@/types/listing";
import {
  login,
  getSellerListings,
  createListing,
  updateListing,
  deleteListing,
} from "@/lib/api";

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
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

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
      if (u.role !== "seller") {
        setLoginError("Seller portal requires a seller account.");
        return;
      }
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
    const payload = {
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
    };
    try {
      if (editingListingId) {
        await updateListing(editingListingId, payload);
        setSuccessMsg("Listing updated!");
      } else {
        await createListing(payload);
        setSuccessMsg("Listing created!");
      }
      setForm(emptyForm);
      setEditingListingId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
      // Refresh my listings
      const updated = await getSellerListings(user.id);
      setMyListings(updated);
    } catch {
      setSuccessMsg(editingListingId ? "Failed to update listing." : "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListingId(listing.id);
    setForm({
      title: listing.title,
      description: listing.description || "",
      price: listing.price.toString(),
      image_url: listing.image_url || "",
      size: listing.size.toString(),
      materials: listing.materials.join(", "),
      colors: listing.colors.join(", "),
      style: listing.style || "",
    });
    setSuccessMsg("");
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleInputRef.current?.focus();
    }, 0);
  };

  const handleCancelEdit = () => {
    setEditingListingId(null);
    setForm(emptyForm);
    setSuccessMsg("");
  };

  const handleDelete = async (listingId: number) => {
    if (!user) return;
    if (!window.confirm("Delete this listing?")) return;
    setSuccessMsg("");
    try {
      await deleteListing(listingId, user.id);
      const updated = await getSellerListings(user.id);
      setMyListings(updated);
      if (editingListingId === listingId) {
        handleCancelEdit();
      }
      setSuccessMsg("Listing deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to delete listing.");
    }
  };

  const inputClass =
    "w-full p-2 border border-gray-300 rounded text-sm";
  const inventoryCount = myListings.length;
  const totalInventoryValue = myListings.reduce(
    (sum, listing) => sum + listing.price,
    0
  );

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
          Try: seller1@example.com / pass1
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
      <section className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Active Listings</p>
          <p className="text-xl font-bold">{inventoryCount}</p>
        </div>
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Total Inventory Value</p>
          <p className="text-xl font-bold">${totalInventoryValue.toFixed(2)}</p>
        </div>
      </section>

      {/* Create listing form */}
      <section ref={formSectionRef} className="mb-8">
        <h2 className="text-lg font-bold mb-4">
          {editingListingId ? "Edit Listing" : "Create New Listing"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <input
            ref={titleInputRef}
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
              {submitting
                ? editingListingId
                  ? "Updating..."
                  : "Creating..."
                : editingListingId
                  ? "Update Listing"
                  : "Create Listing"}
            </button>
            {editingListingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
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
              className={`border rounded-lg p-3 flex flex-col gap-1 ${
                editingListingId === listing.id
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-gray-200"
              }`}
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
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(listing)}
                  className={`flex-1 py-1.5 border rounded text-sm cursor-pointer ${
                    editingListingId === listing.id
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {editingListingId === listing.id ? "Editing..." : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(listing.id)}
                  className="flex-1 py-1.5 border border-red-200 text-red-600 rounded text-sm cursor-pointer hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
