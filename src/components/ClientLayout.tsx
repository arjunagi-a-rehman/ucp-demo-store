"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AgentChat } from "@/components/AgentChat";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster />
        <AgentChat />
      </CartProvider>
    </AuthProvider>
  );
}
