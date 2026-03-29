"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useCartContext } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Package, LogOut, Shield, User } from "lucide-react";

export function Navbar() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const { totalItems } = useCartContext();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8e0d6]/60 bg-[#faf8f5]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1714] transition-transform group-hover:scale-105">
            <span className="text-sm font-bold text-[#faf8f5]">U</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1a1714]">
            UCP Store
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-[13px] font-medium tracking-wide uppercase text-[#8a8279] transition-colors hover:text-[#1a1714]"
          >
            Shop
          </Link>

          {user && (
            <Link href="/cart" className="group relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f0ebe4]">
                <ShoppingCart className="h-[18px] w-[18px] text-[#5c564e] transition-colors group-hover:text-[#1a1714]" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c8956c] px-1 text-[10px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none ring-2 ring-transparent transition-all hover:ring-[#c8956c]/40">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-[#f0ebe4] text-[#5c564e] text-sm font-medium">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#e8e0d6] bg-white shadow-xl shadow-black/5">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#1a1714]">{user.displayName}</p>
                  <p className="text-xs text-[#8a8279]">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#e8e0d6]" />
                <DropdownMenuItem className="cursor-pointer rounded-lg">
                  <Link href="/orders" className="flex w-full items-center">
                    <Package className="mr-2 h-4 w-4 text-[#8a8279]" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {profile?.role === "admin" && (
                  <DropdownMenuItem className="cursor-pointer rounded-lg">
                    <Link href="/admin" className="flex w-full items-center">
                      <Shield className="mr-2 h-4 w-4 text-[#8a8279]" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#e8e0d6]" />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer rounded-lg text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={signInWithGoogle}
              className="h-9 rounded-full bg-[#1a1714] px-5 text-xs font-medium tracking-wide text-[#faf8f5] shadow-sm transition-all hover:bg-[#3d3831] hover:shadow-md"
            >
              <User className="mr-1.5 h-3.5 w-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
