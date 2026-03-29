import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");

    let q = adminDb.collection("orders").orderBy("createdAt", "desc");
    if (userId) {
      q = adminDb
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc");
    }

    const snap = await q.get();
    const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
