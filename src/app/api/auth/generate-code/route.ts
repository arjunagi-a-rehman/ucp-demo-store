import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";

// In-memory auth code store (TTL 5 minutes)
const authCodes = new Map<string, { uid: string; email: string; expiresAt: number }>();

// Cleanup expired codes periodically
function cleanupCodes() {
  const now = Date.now();
  for (const [code, data] of authCodes) {
    if (data.expiresAt < now) {
      authCodes.delete(code);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, redirectUri, state } = await request.json();

    if (!idToken || !redirectUri) {
      return NextResponse.json({ error: "Missing idToken or redirectUri" }, { status: 400 });
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decoded;

    // Generate a one-time auth code
    cleanupCodes();
    const authCode = randomUUID();
    authCodes.set(authCode, {
      uid,
      email: email || "",
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Build redirect URL
    const sep = redirectUri.includes("?") ? "&" : "?";
    let redirectUrl = `${redirectUri}${sep}code=${authCode}`;
    if (state) {
      redirectUrl += `&state=${encodeURIComponent(state)}`;
    }

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Auth code generation failed:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

// Export the authCodes map for the verify-code endpoint
export { authCodes };
