"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, ExternalLink } from "lucide-react";

// Proxy through storefront API routes to avoid CORS
const UCP_API = "https://ucp.c0a1.in";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl?: string;
  }>;
  signInUrl?: string;
}

export function AgentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "agent", text: "Hi! I'm the UCP Shopping Assistant. I can help you browse products, place orders, and track deliveries. What can I help you with?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId] = useState(() => `web_${Math.random().toString(36).slice(2, 10)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const createSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;
    const res = await fetch("/api/agent/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setSessionId(data.id);
    return data.id;
  }, [sessionId, userId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const sid = await createSession();

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId: sid,
          message: text,
        }),
      });

      if (!res.ok) throw new Error("Agent request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let agentText = "";
      let products: ChatMessage["products"] = undefined;
      let signInUrl: string | undefined = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            const parts = event?.content?.parts || [];

            for (const part of parts) {
              // Agent text response
              if (part.text) {
                agentText += part.text;
              }

              // Tool response — check for products with images
              if (part.functionResponse) {
                const resp = part.functionResponse.response;
                if (resp?.products && Array.isArray(resp.products)) {
                  // Fetch full product details with images
                  const productList = await Promise.all(
                    resp.products.slice(0, 6).map(async (p: { id: string; name: string; price: number; category: string; description: string }) => {
                      try {
                        const pRes = await fetch(`${UCP_API}/products/${p.id}`);
                        const full = await pRes.json();
                        return { ...p, imageUrl: full.imageUrl };
                      } catch {
                        return p;
                      }
                    })
                  );
                  products = productList;
                }

                // Check for sign-in URL
                if (resp?.sign_in_url) {
                  signInUrl = resp.sign_in_url;
                }
              }
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      if (agentText || products || signInUrl) {
        setMessages((prev) => [...prev, {
          role: "agent",
          text: agentText,
          products,
          signInUrl,
        }]);
      }
    } catch (error) {
      console.error("Agent error:", error);
      setMessages((prev) => [...prev, {
        role: "agent",
        text: "Sorry, I encountered an error. Please try again.",
      }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1714] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[400px] flex-col overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1a1714] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium text-sm">UCP Shopping Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "agent" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-[#f5f2ee] flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-[#1a1714]" />
                    </div>
                  </div>
                )}
                <div className={`max-w-[85%] space-y-2`}>
                  {msg.text && (
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1a1714] text-white rounded-br-md"
                          : "bg-[#f5f2ee] text-[#1a1714] rounded-bl-md"
                      }`}
                    >
                      {msg.text.split("\n").map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                      ))}
                    </div>
                  )}

                  {/* Sign in link */}
                  {msg.signInUrl && (
                    <a
                      href={msg.signInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      <span>Sign in with Google to continue</span>
                    </a>
                  )}

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {msg.products.map((p) => (
                        <a
                          key={p.id}
                          href={`/products/${p.id}`}
                          className="flex-shrink-0 w-36 rounded-xl border border-[#e8e4df] overflow-hidden hover:shadow-md transition-shadow bg-white"
                        >
                          {p.imageUrl && (
                            <div className="h-24 bg-[#f5f2ee] overflow-hidden">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-xs font-medium text-[#1a1714] line-clamp-1">{p.name}</p>
                            <p className="text-xs font-bold text-[#1a1714] mt-0.5">₹{p.price.toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-[#8a8279] mt-0.5">{p.category}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-[#1a1714] flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-[#f5f2ee] flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-[#1a1714]" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-[#f5f2ee] px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#8a8279] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#8a8279] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#8a8279] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e8e4df] p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products..."
                className="flex-1 rounded-xl border border-[#e8e4df] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#1a1714] placeholder:text-[#8a8279] focus:outline-none focus:ring-2 focus:ring-[#1a1714]/20"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1714] text-white transition-colors hover:bg-[#2a2724] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-[#8a8279]">
              Powered by UCP + Google Gemini
            </p>
          </div>
        </div>
      )}
    </>
  );
}
