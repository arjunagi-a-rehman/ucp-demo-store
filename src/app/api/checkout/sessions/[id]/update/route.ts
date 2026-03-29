import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { buyer } = await request.json();

    const docRef = adminDb.collection("checkout_sessions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = doc.data()!;

    if (session.status === "complete") {
      return NextResponse.json({ error: "Session already complete" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (buyer) {
      updates.buyer = buyer;
      // Auto-transition if all buyer info is present
      if (buyer.email && buyer.shippingAddress && buyer.paymentMethod) {
        updates.status = "ready_for_complete";
      }
    }

    await docRef.update(updates);

    const updated = await docRef.get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
