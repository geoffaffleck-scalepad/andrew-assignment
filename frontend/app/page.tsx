"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Listing, User } from "@/types/listing";
import { getListings, login } from "@/lib/api";

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cart, setCart] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [buyer, setBuyer] = useState<User | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    shippingName: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

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
    setCheckoutError("");
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setCheckoutError("");
    try {
      const user = await login(buyerEmail, buyerPassword);
      if (user.role !== "buyer") {
        setLoginError("Please use a buyer account.");
        return;
      }
      setBuyer(user);
    } catch {
      setLoginError("Login failed. Please check your credentials.");
    }
  };

  const handleBuyerLogout = () => {
    setBuyer(null);
    setBuyerEmail("");
    setBuyerPassword("");
    setLoginError("");
  };

  const handleCheckoutFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckoutForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    if (!buyer) {
      setCheckoutError("Please sign in as a buyer before checkout.");
      return;
    }

    const requiredFields = Object.values(checkoutForm).every(
      (value) => value.trim() !== ""
    );
    if (!requiredFields) {
      setCheckoutError("Please complete payment and shipping details.");
      return;
    }

    setCart([]);
    setCheckoutForm({
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      shippingName: "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
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
          className="px-4 py-2 bg-blue-700 text-white rounded-md font-medium border border-blue-800 shadow-sm hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
        >
          Seller Portal
        </Link>
      </div>
      <section className="mb-6 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Buyer Login</h2>
          {buyer && (
            <button
              type="button"
              onClick={handleBuyerLogout}
              className="text-sm text-gray-600 hover:underline cursor-pointer"
            >
              Log out
            </button>
          )}
        </div>
        {!buyer ? (
          <form onSubmit={handleBuyerLogin} className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="buyer email"
              className="p-2 border border-gray-300 rounded text-sm"
              required
            />
            <input
              type="password"
              value={buyerPassword}
              onChange={(e) => setBuyerPassword(e.target.value)}
              placeholder="password"
              className="p-2 border border-gray-300 rounded text-sm"
              required
            />
            <button
              type="submit"
              className="py-2 px-4 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 cursor-pointer"
            >
              Sign In as Buyer
            </button>
            {loginError && (
              <p className="md:col-span-3 text-sm text-red-600">{loginError}</p>
            )}
          </form>
        ) : (
          <p className="text-sm text-gray-700">
            Signed in as <span className="font-semibold">{buyer.email}</span> (id:{" "}
            <span className="font-mono">{buyer.id}</span>)
          </p>
        )}
      </section>

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
            <form onSubmit={handleCheckout} className="mt-4 space-y-2">
              <p className="font-bold mb-2">Total: ${total}</p>
              <p className="text-sm font-semibold mt-3">Payment Information</p>
              <input
                name="cardName"
                value={checkoutForm.cardName}
                onChange={handleCheckoutFieldChange}
                placeholder="Name on card"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                name="cardNumber"
                value={checkoutForm.cardNumber}
                onChange={handleCheckoutFieldChange}
                placeholder="Card number"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <div className="flex gap-2">
                <input
                  name="expiry"
                  value={checkoutForm.expiry}
                  onChange={handleCheckoutFieldChange}
                  placeholder="MM/YY"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
                <input
                  name="cvv"
                  value={checkoutForm.cvv}
                  onChange={handleCheckoutFieldChange}
                  placeholder="CVV"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <p className="text-sm font-semibold mt-3">Shipping Address</p>
              <input
                name="shippingName"
                value={checkoutForm.shippingName}
                onChange={handleCheckoutFieldChange}
                placeholder="Recipient name"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                name="addressLine1"
                value={checkoutForm.addressLine1}
                onChange={handleCheckoutFieldChange}
                placeholder="Address line 1"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                name="city"
                value={checkoutForm.city}
                onChange={handleCheckoutFieldChange}
                placeholder="City"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <div className="flex gap-2">
                <input
                  name="state"
                  value={checkoutForm.state}
                  onChange={handleCheckoutFieldChange}
                  placeholder="State"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
                <input
                  name="zip"
                  value={checkoutForm.zip}
                  onChange={handleCheckoutFieldChange}
                  placeholder="ZIP code"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <input
                name="country"
                value={checkoutForm.country}
                onChange={handleCheckoutFieldChange}
                placeholder="Country"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              {checkoutError && (
                <p className="text-sm text-red-600">{checkoutError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white rounded cursor-pointer text-base hover:bg-gray-700"
              >
                Checkout
              </button>
            </form>
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
