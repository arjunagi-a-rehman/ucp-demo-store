import { NextRequest, NextResponse } from "next/server";
import { getDoc, updateDoc } from "@/lib/firestore-rest";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { buyer } = await request.json();

    const session = await getDoc("checkout_sessions", id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "complete") {
      return NextResponse.json({ error: "Session already complete" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (buyer) {
      updates.buyer = buyer;
      // Auto-transition if all buyer info is present
      if (buyer.email && (buyer.shippingAddress || buyer.shipping_address) && (buyer.paymentMethod || buyer.payment_method)) {
        updates.status = "ready_for_complete";
      }
    }

    await updateDoc("checkout_sessions", id, updates);

    const updated = await getDoc("checkout_sessions", id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
