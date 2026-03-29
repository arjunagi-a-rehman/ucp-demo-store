import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { line_items, user_id } = await request.json();

    if (!line_items || !Array.isArray(line_items)) {
      return NextResponse.json({ error: "line_items is required" }, { status: 400 });
    }

    const sessionId = randomUUID();
    const session = {
      userId: user_id || "",
      status: "incomplete",
      lineItems: line_items,
      buyer: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("checkout_sessions").doc(sessionId).set(session);

    return NextResponse.json({ id: sessionId, ...session });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
