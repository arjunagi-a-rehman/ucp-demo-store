"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useCartContext } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, ShoppingBag, IndianRupee, Download } from "lucide-react";
import { toast } from "sonner";
import { generateInvoice } from "@/lib/generate-invoice";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCartContext();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    items: typeof items;
    total: number;
    razorpayPaymentId?: string;
  } | null>(null);

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const shippingValid =
    shipping.street && shipping.city && shipping.state && shipping.zip;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-500">Please sign in to checkout.</p>
      </div>
    );
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <LinkButton href="/" className="mt-4">
          Continue Shopping
        </LinkButton>
      </div>
    );
  }

  // Order confirmation
  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-gray-500">Order ID: {orderId}</p>
        <p className="mt-1 text-sm text-gray-400">
          Payment was processed via Razorpay.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (completedOrder) {
                generateInvoice({
                  orderId: orderId!,
                  date: new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  buyerEmail: user.email || "",
                  shippingAddress: shipping,
                  items: completedOrder.items.map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  total: completedOrder.total,
                  razorpayPaymentId: completedOrder.razorpayPaymentId,
                });
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <div className="flex gap-3">
            <LinkButton href="/orders" variant="outline">
              View Orders
            </LinkButton>
            <LinkButton href="/">Continue Shopping</LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const handlePayWithRazorpay = async () => {
    if (!shippingValid) {
      toast.error("Please fill in your shipping address.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create Razorpay order");
      }

      const razorpayOrder = await orderRes.json();

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "UCP Demo Store",
        description: `${items.length} item(s)`,
        order_id: razorpayOrder.id,
        prefill: {
          email: user.email || "",
          name: user.displayName || "",
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify payment on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: {
                  userId: user.uid,
                  lineItems: items.map((item) => ({
                    id: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  buyer: {
                    email: user.email || "",
                    shippingAddress: shipping,
                  },
                  total: totalPrice,
                },
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyRes.json();
            setCompletedOrder({
              items: [...items],
              total: totalPrice,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            await clearCart();
            setOrderId(result.orderId);
            toast.success("Payment successful! Order placed.");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-5">
        {/* Left: Shipping */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={shipping.street}
                  onChange={(e) =>
                    setShipping({ ...shipping, street: e.target.value })
                  }
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping({ ...shipping, state: e.target.value })
                    }
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">PIN Code</Label>
                  <Input
                    id="zip"
                    value={shipping.zip}
                    onChange={(e) =>
                      setShipping({ ...shipping, zip: e.target.value })
                    }
                    placeholder="400001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="truncate mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="flex-shrink-0 font-medium">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handlePayWithRazorpay}
                disabled={submitting || !shippingValid}
              >
                <IndianRupee className="mr-1 h-4 w-4" />
                {submitting
                  ? "Processing..."
                  : `Pay ₹${totalPrice.toLocaleString("en-IN")}`}
              </Button>

              <p className="text-center text-xs text-gray-400">
                Powered by Razorpay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
