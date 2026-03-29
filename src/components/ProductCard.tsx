"use client";

import Link from "next/link";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e8e0d6]/80 transition-all duration-500 hover:shadow-xl hover:shadow-[#c8956c]/8 hover:ring-[#c8956c]/20">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f0ebe4]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#5c564e] shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          </div>
          {/* Quick view hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#1a1714] shadow-lg">
              View Details
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-[#1a1714] line-clamp-1 transition-colors group-hover:text-[#c8956c]">
            {product.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#8a8279] line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-[#1a1714]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0ebe4] transition-colors group-hover:bg-[#c8956c]">
              <svg className="h-4 w-4 text-[#5c564e] transition-colors group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
