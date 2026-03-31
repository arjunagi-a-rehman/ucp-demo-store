import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setDoc } from "@/lib/firestore-rest";

export async function POST(request: NextRequest) {
  try {
    const { idToken, redirectUri, state } = await request.json();

    if (!idToken || !redirectUri) {
      return NextResponse.json({ error: "Missing idToken or redirectUri" }, { status: 400 });
    }

    // Verify the Firebase ID token using the REST API
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const verifyData = await verifyRes.json();
    const user = verifyData.users?.[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const uid = user.localId;
    const email = user.email || "";

    // Store auth code in Firestore (so it works across Cloud Function instances)
    const authCode = randomUUID();
    await setDoc("auth_codes", authCode, {
      uid,
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
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
