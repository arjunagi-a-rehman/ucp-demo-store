import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = adminDb.collection("checkout_sessions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = doc.data()!;

    if (session.status !== "ready_for_complete") {
      return NextResponse.json(
        { error: "Session is not ready for completion" },
        { status: 400 }
      );
    }

    // Complete the session
    await docRef.update({
      status: "complete",
      updatedAt: new Date().toISOString(),
    });

    // Create the order
    const orderId = `ORD-${id.slice(0, 8).toUpperCase()}`;
    const total = (session.lineItems || []).reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    await adminDb.collection("orders").doc(orderId).set({
      userId: session.userId || "",
      status: "processing",
      lineItems: session.lineItems || [],
      buyer: session.buyer || {},
      total,
      trackingUrl: null,
      checkoutSessionId: id,
      createdAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    return NextResponse.json({
      id: updated.id,
      ...updated.data(),
      orderId,
    });
  } catch (error) {
    console.error("Failed to complete session:", error);
    return NextResponse.json({ error: "Failed to complete session" }, { status: 500 });
  }
}
