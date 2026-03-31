import { NextRequest, NextResponse } from "next/server";
import { getDoc, setDoc } from "@/lib/firestore-rest";

export async function POST(request: NextRequest) {
  try {
    const { code, api_key } = await request.json();

    // Validate API key
    const expectedKey = process.env.STOREFRONT_API_KEY;
    if (expectedKey && api_key !== expectedKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Look up auth code in Firestore
    const authData = await getDoc("auth_codes", code);
    if (!authData) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Check expiry
    const expiresAt = new Date(authData.expiresAt as string).getTime();
    if (expiresAt < Date.now()) {
      // Delete expired code
      await setDoc("auth_codes", code, { expired: true });
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // Mark as used
    await setDoc("auth_codes", code, { ...authData, used: true });

    return NextResponse.json({
      uid: authData.uid,
      email: authData.email,
    });
  } catch (error) {
    console.error("Code verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
