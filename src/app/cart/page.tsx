"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useCartContext } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCartContext();
  const router = useRouter();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-[#e8e0d6]" />
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#1a1714]">
          Sign in to view your cart
        </h2>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-[#e8e0d6]" />
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#1a1714]">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-[#8a8279]">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a1714] px-6 py-3 text-sm font-medium text-[#faf8f5] transition-colors hover:bg-[#3d3831]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#1a1714]">
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm text-[#8a8279]">{items.length} item{items.length > 1 ? "s" : ""}</p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#e8e0d6]/60 transition-shadow hover:shadow-md"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f0ebe4]">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1a1714] truncate">{item.name}</h3>
              <p className="text-sm font-medium text-[#c8956c]">₹{item.price.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex items-center rounded-full bg-[#f0ebe4]">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#e8e0d6]"
              >
                <Minus className="h-3 w-3 text-[#5c564e]" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#e8e0d6]"
              >
                <Plus className="h-3 w-3 text-[#5c564e]" />
              </button>
            </div>
            <p className="w-24 text-right font-bold text-[#1a1714]">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </p>
            <button
              onClick={() => removeFromCart(item.productId)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#e8e0d6]/60">
        <div className="flex items-center justify-between">
          <span className="text-[#8a8279]">Subtotal</span>
          <span className="font-semibold text-[#1a1714]">₹{totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#8a8279]">Delivery</span>
          <span className="text-sm font-medium text-green-600">Free</span>
        </div>
        <div className="mt-4 border-t border-[#e8e0d6] pt-4">
          <div className="flex items-center justify-between text-xl font-bold text-[#1a1714]">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <Button
          className="mt-6 h-12 w-full rounded-full bg-[#1a1714] text-sm font-semibold text-[#faf8f5] shadow-lg transition-all hover:bg-[#3d3831] hover:shadow-xl"
          onClick={() => router.push("/checkout")}
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
