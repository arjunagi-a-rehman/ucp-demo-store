import { NextRequest, NextResponse } from "next/server";
import { authCodes } from "../generate-code/route";

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

    const authData = authCodes.get(code);
    if (!authData) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Check expiry
    if (authData.expiresAt < Date.now()) {
      authCodes.delete(code);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // Delete the code (one-time use)
    authCodes.delete(code);

    return NextResponse.json({
      uid: authData.uid,
      email: authData.email,
    });
  } catch (error) {
    console.error("Code verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
