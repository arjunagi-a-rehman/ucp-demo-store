import { NextRequest } from "next/server";

const AGENT_URL = "https://ucp-shopping-agent-189730860966.us-central1.run.app";
const APP_NAME = "ucp_agent";

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message } = await request.json();

    const res = await fetch(`${AGENT_URL}/run_sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_name: APP_NAME,
        user_id: userId,
        session_id: sessionId,
        new_message: { role: "user", parts: [{ text: message }] },
      }),
    });

    if (!res.ok || !res.body) {
      return new Response(JSON.stringify({ error: "Agent request failed" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream SSE through to the client
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Agent chat error:", error);
    return new Response(JSON.stringify({ error: "Agent chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
