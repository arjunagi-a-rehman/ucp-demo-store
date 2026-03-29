"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useCartContext } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Minus, Plus, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const { addToCart } = useCartContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const docRef = doc(db, "products", params.id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (product) {
      await addToCart(product, quantity);
      setAddedToCart(true);
      toast.success(`${product.name} added to cart`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="animate-shimmer aspect-square rounded-3xl" />
          <div className="space-y-4">
            <div className="animate-shimmer h-8 w-3/4 rounded-lg" />
            <div className="animate-shimmer h-6 w-1/3 rounded-lg" />
            <div className="animate-shimmer h-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="text-[#8a8279]">Product not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-[#c8956c] hover:underline">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/"
        className="group mb-8 inline-flex items-center gap-2 text-sm text-[#8a8279] transition-colors hover:text-[#1a1714]"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Store
      </Link>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="animate-scale-in relative aspect-square overflow-hidden rounded-3xl bg-[#f0ebe4]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5c564e] shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="animate-slide-in-right flex flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8956c]">
            {product.category}
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#1a1714]">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-[#1a1714]">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8a8279]">
            {product.description}
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex gap-6">
            {[
              { icon: Truck, label: "Free Delivery" },
              { icon: Shield, label: "Secure Pay" },
              { icon: RotateCcw, label: "Easy Returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-[#c8956c]" />
                <span className="text-xs font-medium text-[#5c564e]">{label}</span>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-medium text-[#5c564e]">Quantity</span>
            <div className="flex items-center rounded-full bg-[#f0ebe4]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#e8e0d6]"
              >
                <Minus className="h-4 w-4 text-[#5c564e]" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#e8e0d6]"
              >
                <Plus className="h-4 w-4 text-[#5c564e]" />
              </button>
            </div>
          </div>

          {/* CTA */}
          {addedToCart ? (
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-full border-[#e8e0d6] text-sm font-medium"
                onClick={() => setAddedToCart(false)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add More
              </Button>
              <Button
                className="flex-1 h-12 rounded-full bg-[#c8956c] text-sm font-medium text-white shadow-lg shadow-[#c8956c]/20 hover:bg-[#b8855c]"
                onClick={() => router.push("/cart")}
              >
                <Check className="mr-2 h-4 w-4" />
                Go to Cart
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="mt-6 h-12 w-full rounded-full bg-[#1a1714] text-sm font-medium text-[#faf8f5] shadow-lg transition-all hover:bg-[#3d3831] hover:shadow-xl"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {user ? "Add to Cart" : "Sign in to Add to Cart"}
            </Button>
          )}

          {product.inventory <= 10 && product.inventory > 0 && (
            <p className="mt-3 text-center text-sm font-medium text-[#c8956c]">
              Only {product.inventory} left in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
