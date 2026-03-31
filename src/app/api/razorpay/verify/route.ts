import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setDoc } from "@/lib/firestore-rest";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data,
    } = await request.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    const newOrderId = `ORD-${sessionId.slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    // Write checkout session
    await setDoc("checkout_sessions", sessionId, {
      userId: order_data.userId,
      status: "complete",
      lineItems: order_data.lineItems,
      buyer: order_data.buyer,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      createdAt: now,
      updatedAt: now,
    });

    // Write order
    await setDoc("orders", newOrderId, {
      userId: order_data.userId,
      status: "processing",
      lineItems: order_data.lineItems,
      buyer: order_data.buyer,
      total: order_data.total,
      trackingUrl: null,
      checkoutSessionId: sessionId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      createdAt: now,
    });

    // Clear cart
    await setDoc("carts", order_data.userId, {
      items: [],
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrderId,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
