import { NextResponse } from "next/server";
import { listDocs } from "@/lib/firestore-rest";

export async function GET() {
  try {
    const products = await listDocs("products", {
      orderBy: "createdAt",
      orderDirection: "DESCENDING",
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
