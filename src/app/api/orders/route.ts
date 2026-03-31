import { NextRequest, NextResponse } from "next/server";
import { listDocs } from "@/lib/firestore-rest";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");

    const options: Parameters<typeof listDocs>[1] = {
      orderBy: "createdAt",
      orderDirection: "DESCENDING",
    };

    if (userId) {
      options.where = { field: "userId", op: "EQUAL", value: userId };
    }

    const orders = await listDocs("orders", options);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
