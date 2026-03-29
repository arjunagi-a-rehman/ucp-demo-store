"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Package, Download } from "lucide-react";
import { generateInvoice } from "@/lib/generate-invoice";
import Link from "next/link";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  processing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  shipped: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setOrders(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
      );
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  const handleDownloadInvoice = (order: Order) => {
    const createdAt = order.createdAt
      ? new Date(
          (order.createdAt as unknown as { seconds: number }).seconds * 1000
        )
      : new Date();

    generateInvoice({
      orderId: order.id,
      date: createdAt.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      buyerEmail: order.buyer?.email || user?.email || "",
      shippingAddress: order.buyer?.shippingAddress,
      items: order.lineItems,
      total: order.total,
      razorpayPaymentId: (order as unknown as Record<string, unknown>).razorpayPaymentId as string | undefined,
    });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[#8a8279]">Please sign in to view your orders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#1a1714]">My Orders</h1>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#1a1714]">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-20 text-center">
          <Package className="mx-auto h-16 w-16 text-[#e8e0d6]" />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#1a1714]">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-[#8a8279]">Your order history will appear here.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a1714] px-6 py-3 text-sm font-medium text-[#faf8f5] transition-colors hover:bg-[#3d3831]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.processing;
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8e0d6]/60 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1a1714]">{order.id}</p>
                    <p className="mt-0.5 text-xs text-[#8a8279]">
                      {order.createdAt
                        ? new Date(
                            (order.createdAt as unknown as { seconds: number }).seconds * 1000
                          ).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1.5 rounded-full ${status.bg} px-3 py-1`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-semibold capitalize ${status.text}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-[#1a1714]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.lineItems.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full bg-[#f0ebe4] px-3 py-1 text-xs font-medium text-[#5c564e]"
                    >
                      {item.name} &times;{item.quantity}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[#e8e0d6] text-xs font-medium transition-colors hover:border-[#c8956c] hover:text-[#c8956c]"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Invoice
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
