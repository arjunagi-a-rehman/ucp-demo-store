# UCP Demo Store

A modern e-commerce storefront built to demonstrate the **Universal Commerce Protocol (UCP)** — an open standard that lets AI agents discover, browse, and transact with online merchants.

**Live Store**: [ucp-demo-1f0cf.web.app](https://ucp-demo-1f0cf.web.app) | **UCP API**: [ucp.c0a1.in](https://ucp.c0a1.in) | **AI Agent**: [Cloud Run](https://ucp-shopping-agent-189730860966.us-central1.run.app)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase) ![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue?logo=razorpay) ![UCP](https://img.shields.io/badge/UCP-Enabled-green) ![Google ADK](https://img.shields.io/badge/Google_ADK-Agent-blue?logo=google)

---

## Architecture

```
[Human Customer]  →  [Next.js Storefront]  →  [Firebase Backend]
                            ↑
[AI Agent (Gemini)] → [UCP API (FastAPI)] → [Storefront /api/* routes]
                            ↑
                     [Agent Chat Widget]
                     (embedded in store)
```

The store serves three audiences:
1. **Humans** — browse, cart, Razorpay checkout, order history
2. **AI Agents** — UCP protocol for programmatic commerce
3. **Embedded Agent** — chat widget on the store powered by Google ADK + Gemini

---

## What is UCP?

The **Universal Commerce Protocol** ([ucp.dev](https://ucp.dev)) provides a standardized interface between e-commerce backends and AI agents:

- **Discovery** — AI agents find merchants via `/.well-known/ucp`
- **Authentication** — OAuth 2.0 identity linking with agent polling pattern
- **Browsing** — Structured product catalog access
- **Checkout** — State machine: `incomplete → ready_for_complete → complete`
- **Order Tracking** — Post-purchase order status and history

**The most exciting part:** You can give the discovery URL (`https://ucp.c0a1.in/.well-known/ucp`) to **any AI agent** that can make HTTP calls — Claude Code, Cursor, ChatGPT with function calling, any custom agent — and it will figure out how to shop. No SDKs, no plugins, no custom integrations. Just one URL and the protocol does the rest.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Payments | Razorpay (live integration) |
| Hosting | Firebase Hosting + Cloud Functions |
| AI Agent | Google ADK + Gemini 2.0 Flash |
| UCP API | FastAPI (Python) |
| Design | Sora + Instrument Serif typography, warm editorial palette |

---

## Features

### For Customers
- Google Sign-In authentication
- Product catalog with category filtering
- Shopping cart with real-time sync
- Razorpay checkout with real payments (INR)
- Order history with PDF invoice download
- **Embedded AI shopping assistant** (chat widget)
- Responsive design with smooth animations

### For AI Agents (UCP)
- `/.well-known/ucp` self-describing discovery endpoint
- OAuth 2.0 with agent polling pattern (no browser automation needed)
- RESTful product catalog with images
- State-machine checkout sessions
- `next_actions` in every response — agents always know what to do next
- Actionable error messages with remediation steps
- Works with any agent that can make HTTP calls

### For Admins
- Product management (create, edit, delete)
- Image upload to Firebase Storage
- Role-based access control

---

## AI Agent

The store includes a built-in AI shopping assistant powered by **Google ADK** and **Gemini 2.0 Flash**. It's deployed on Cloud Run and embedded in the storefront as a chat widget.

### What the Agent Can Do

| Capability | How It Works |
|-----------|-------------|
| Browse products | Calls `GET /products` via UCP |
| Show product details | Calls `GET /products/{id}` with images |
| Link user account | OAuth 2.0 — generates sign-in link, polls for token |
| Create checkout | `POST /checkout/sessions` with line items |
| Collect shipping info | `POST /checkout/sessions/{id}/update` |
| Place order | `POST /checkout/sessions/{id}/complete` |
| Track orders | `GET /orders/{id}` |

### Agent Architecture

```
ucp_agent/
├── __init__.py          # ADK discovery
├── agent.py             # root_agent — Gemini 2.5 Flash, 10 tools
├── tools.py             # 3 auth tools + 7 commerce tools
├── ucp_client.py        # httpx wrapper for UCP API
├── .env                 # GOOGLE_API_KEY, UCP_BASE_URL
└── requirements.txt     # google-adk, httpx
```

### Identity Linking Flow (Seamless — No Copy-Paste)

```
1. User: "I want to buy headphones"
2. Agent calls link_account() → generates OAuth URL
3. Agent: "Please sign in here: [link]"
4. User clicks → signs in with Google → sees "Success! Close this tab."
5. Agent polls /agent/session/{id} → picks up JWT automatically
6. Agent: "Account linked! Creating your order..."
```

The user just clicks a link and signs in. The agent handles everything else.

### Run the Agent Locally

```bash
# Prerequisites: Python 3.10+, uv
cd ucp_agent

# Install dependencies
uv sync

# Add your Gemini API key
echo "GOOGLE_API_KEY=your_key_here" > .env
echo "UCP_BASE_URL=https://ucp.c0a1.in" >> .env

# Run with ADK web UI
cd ..
uv run --project ucp_agent adk web .

# Open http://localhost:8000, select "ucp_agent"
```

### Deploy the Agent to Cloud Run

```bash
cd /path/to/ai-ucp

# Deploy with built-in chat UI
uv run --project ucp_agent adk deploy cloud_run \
    --project=your-gcp-project \
    --region=us-central1 \
    --service_name=ucp-shopping-agent \
    --with_ui \
    ucp_agent

# Set environment variables
gcloud run services update ucp-shopping-agent \
    --region=us-central1 \
    --set-env-vars="GOOGLE_API_KEY=your_key,UCP_BASE_URL=https://ucp.c0a1.in"

# Rate limit for safety
gcloud run services update ucp-shopping-agent \
    --region=us-central1 \
    --max-instances=2 \
    --concurrency=10
```

### Use UCP with Any Agent

The UCP discovery endpoint is self-describing. Give this URL to **any** AI agent:

```
https://ucp.c0a1.in/.well-known/ucp
```

It works with:
- **Claude Code / Claude** — can read the discovery and call APIs directly
- **Cursor / Windsurf** — same, just give it the URL
- **ChatGPT with function calling** — auto-discovers endpoints
- **Google ADK agents** — native tool integration
- **Any custom agent** with HTTP access — the protocol is self-describing

No SDKs. No plugins. Just one URL.

---

## Getting Started (Store)

### Prerequisites

- Node.js 18+
- Firebase project with Blaze plan
- Razorpay account (for payments)

### 1. Clone and Install

```bash
git clone https://github.com/arjunagi-a-rehman/ucp-demo-store.git
cd ucp-demo-store
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in method → Google
3. Enable **Cloud Firestore** (start in test mode)
4. Enable **Storage**
5. Add a **Web app** and copy the config
6. Generate a **Service Account key** (Project Settings → Service Accounts)

Save the service account key as `Service_Account.json` in the project root.

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GCP_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx

STOREFRONT_API_KEY=your-internal-api-key
```

### 4. Seed the Database

```bash
npx tsx scripts/seed.ts
```

### 5. Make Yourself Admin

```bash
npx tsx scripts/make-admin.ts <your-firebase-uid>
```

Find your Firebase UID in the Firebase Console → Authentication → Users.

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

```bash
# Login to Firebase CLI
firebase login

# Deploy to Firebase Hosting
firebase deploy --only hosting --force
```

The app deploys as a Cloud Function (SSR) behind Firebase Hosting.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage — hero + product grid
│   ├── products/[id]/page.tsx      # Product detail page
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Razorpay checkout flow
│   ├── orders/page.tsx             # Order history + PDF invoice
│   ├── admin/                      # Admin panel (product CRUD)
│   ├── login/
│   │   └── merchant/page.tsx       # UCP OAuth login page
│   └── api/
│       ├── products/               # Product catalog API
│       ├── orders/                 # Order management API
│       ├── checkout/sessions/      # UCP checkout session API
│       ├── auth/                   # UCP OAuth endpoints
│       ├── agent/                  # Agent proxy (session + chat SSE)
│       └── razorpay/               # Payment order + verification
├── components/
│   ├── AgentChat.tsx               # Embedded AI chat widget
│   ├── AuthProvider.tsx            # Firebase Auth context
│   ├── CartProvider.tsx            # Cart state (Firestore-synced)
│   ├── ClientLayout.tsx            # Layout with Navbar + Agent chat
│   ├── Navbar.tsx                  # Navigation bar
│   ├── ProductCard.tsx             # Product card with hover effects
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── firebase.ts                 # Firebase client SDK init
│   ├── firestore-rest.ts           # Firestore REST API (no firebase-admin)
│   ├── generate-invoice.ts         # jsPDF invoice generator
│   └── types.ts                    # TypeScript interfaces
└── hooks/
    └── useCart.ts                  # Cart operations hook
```

---

## UCP API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/.well-known/ucp` | GET | No | Self-describing discovery document |
| `/oauth/authorize` | GET | No | Start OAuth identity linking |
| `/oauth/token` | POST | No | Exchange code for JWT |
| `/agent/callback` | GET | No | OAuth callback (stores token) |
| `/agent/session/{id}` | GET | No | Poll for auth token |
| `/products` | GET | No | List all products |
| `/products/{id}` | GET | No | Get product details |
| `/checkout/sessions` | POST | Bearer | Create checkout session |
| `/checkout/sessions/{id}` | GET | Bearer | Get session + next_actions |
| `/checkout/sessions/{id}/update` | POST | Bearer | Add buyer info |
| `/checkout/sessions/{id}/complete` | POST | Bearer | Place order |
| `/orders` | GET | Bearer | List user's orders |
| `/orders/{id}` | GET | Bearer | Get order + next_actions |

---

## Related Repos

| Repo | Description |
|------|-------------|
| [ucp-merchant](https://github.com/arjunagi-a-rehman/ucp-merchant) | UCP merchant API (FastAPI) — the protocol layer |
| [UCP Spec](https://github.com/Universal-Commerce-Protocol/ucp) | Official UCP specification |

## License

MIT
