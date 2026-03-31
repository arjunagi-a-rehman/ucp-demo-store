import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = "https://ucp-shopping-agent-189730860966.us-central1.run.app";
const APP_NAME = "ucp_agent";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const res = await fetch(`${AGENT_URL}/apps/${APP_NAME}/users/${userId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to create session" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent session error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
