import { NextRequest, NextResponse } from "next/server";
import { getDoc, updateDoc, setDoc } from "@/lib/firestore-rest";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getDoc("checkout_sessions", id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "ready_for_complete") {
      return NextResponse.json(
        { error: "Session is not ready for completion" },
        { status: 400 }
      );
    }

    // Complete the session
    await updateDoc("checkout_sessions", id, {
      status: "complete",
      updatedAt: new Date().toISOString(),
    });

    // Create the order
    const orderId = `ORD-${id.slice(0, 8).toUpperCase()}`;
    const lineItems = (session.lineItems as Array<{ price: number; quantity: number }>) || [];
    const total = lineItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await setDoc("orders", orderId, {
      userId: (session.userId as string) || "",
      status: "processing",
      lineItems: session.lineItems || [],
      buyer: session.buyer || {},
      total,
      trackingUrl: null,
      checkoutSessionId: id,
      createdAt: new Date().toISOString(),
    });

    const updated = await getDoc("checkout_sessions", id);
    return NextResponse.json({
      ...updated,
      orderId,
    });
  } catch (error) {
    console.error("Failed to complete session:", error);
    return NextResponse.json({ error: "Failed to complete session" }, { status: 500 });
  }
}
