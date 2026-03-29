"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

const categories = ["All", "electronics", "fashion", "home"];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchProducts() {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      );
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1714] noise-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c8956c]/10 via-transparent to-[#c8956c]/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="animate-fade-up text-[13px] font-medium tracking-[0.2em] uppercase text-[#c8956c]">
              Curated Collection
            </p>
            <h1
              className="animate-fade-up mt-4 font-[family-name:var(--font-display)] text-5xl leading-[1.1] text-[#faf8f5] md:text-7xl"
              style={{ animationDelay: "100ms" }}
            >
              Discover What<br />
              <span className="italic text-[#c8956c]">Inspires</span> You
            </h1>
            <p
              className="animate-fade-up mt-6 max-w-md text-[15px] leading-relaxed text-[#8a8279]"
              style={{ animationDelay: "200ms" }}
            >
              Premium products handpicked for quality and design. Shop with
              confidence — powered by the Universal Commerce Protocol.
            </p>
            <div
              className="animate-fade-up mt-8 flex items-center gap-6"
              style={{ animationDelay: "300ms" }}
            >
              <a
                href="#products"
                className="group inline-flex items-center gap-2 rounded-full bg-[#c8956c] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c8956c]/20 transition-all hover:bg-[#b8855c] hover:shadow-xl hover:shadow-[#c8956c]/30"
              >
                Shop Now
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <div className="flex items-center gap-2 text-sm text-[#5c564e]">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-[#1a1714] bg-[#3d3831]" />
                  ))}
                </div>
                <span className="text-[#8a8279]">2k+ happy customers</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="h-80 w-80 rounded-full bg-[#c8956c]/5 blur-3xl" />
          </div>
          <div className="absolute right-20 top-10 hidden lg:block">
            <div className="h-2 w-2 rounded-full bg-[#c8956c]/40" />
          </div>
          <div className="absolute right-40 bottom-16 hidden lg:block">
            <div className="h-1.5 w-1.5 rounded-full bg-[#c8956c]/30" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-16">
        {/* Category Filter */}
        <div className="animate-fade-up flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#1a1714]">
            Our Products
          </h2>
          <div className="flex gap-1 rounded-full bg-[#f0ebe4] p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide capitalize transition-all ${
                  activeCategory === cat
                    ? "bg-[#1a1714] text-[#faf8f5] shadow-sm"
                    : "text-[#8a8279] hover:text-[#1a1714]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-shimmer h-[380px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-16 text-center text-[#8a8279]">
            No products in this category yet.
          </p>
        ) : (
          <div className="stagger-children mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e0d6] bg-[#f0ebe4]/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1714]">
                <span className="text-xs font-bold text-[#faf8f5]">U</span>
              </div>
              <span className="text-sm font-semibold text-[#1a1714]">UCP Demo Store</span>
            </div>
            <p className="text-xs text-[#8a8279]">
              Powered by the Universal Commerce Protocol. Payments by Razorpay.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
