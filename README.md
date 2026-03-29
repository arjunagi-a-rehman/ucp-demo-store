# UCP Demo Store

A modern e-commerce storefront built to demonstrate the **Universal Commerce Protocol (UCP)** — an open standard that lets AI agents discover, browse, and transact with online merchants.

**Live Demo**: [ucp-demo-1f0cf.web.app](https://ucp-demo-1f0cf.web.app)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase) ![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue?logo=razorpay) ![UCP](https://img.shields.io/badge/UCP-Enabled-green)

---

## What is UCP?

The **Universal Commerce Protocol** provides a standardized interface between e-commerce backends and AI agents. It enables:

- **Discovery** — AI agents find merchants via `/.well-known/ucp`
- **Authentication** — OAuth 2.0 flow to link user identity
- **Browsing** — Structured product catalog access
- **Checkout** — Session-based checkout with real payments
- **Order Tracking** — Post-purchase order status and history

This store serves as both a fully functional e-commerce site for human users **and** a UCP-compliant merchant backend for AI agents.

```
[Human Customer] → [Next.js Storefront] → [Firebase Backend]
[AI Agent]        → [UCP API Layer]      → [Firebase Backend]
```

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
| Design | Sora + Instrument Serif typography, warm editorial palette |

## Features

### For Customers
- Google Sign-In authentication
- Product catalog with category filtering
- Shopping cart with real-time sync
- Razorpay checkout with real payments (INR)
- Order history with PDF invoice download
- Responsive design with smooth animations

### For AI Agents (UCP)
- `/.well-known/ucp` discovery endpoint
- OAuth 2.0 authorization flow (`/oauth/authorize`, `/oauth/token`)
- RESTful product catalog (`/api/products`)
- Checkout session management (`/api/checkout/sessions`)
- Order creation and tracking (`/api/orders`)

### For Admins
- Product management (create, edit, delete)
- Image upload to Firebase Storage
- Role-based access control

## Getting Started

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
│       └── razorpay/               # Payment order + verification
├── components/
│   ├── AuthProvider.tsx            # Firebase Auth context
│   ├── CartProvider.tsx            # Cart state (Firestore-synced)
│   ├── Navbar.tsx                  # Navigation bar
│   ├── ProductCard.tsx             # Product card with hover effects
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── firebase.ts                 # Firebase client SDK init
│   ├── firebase-admin.ts           # Firebase Admin SDK init
│   ├── generate-invoice.ts         # jsPDF invoice generator
│   └── types.ts                    # TypeScript interfaces
└── hooks/
    └── useCart.ts                  # Cart operations hook
```

## UCP Integration

To connect an AI agent to this store:

1. **Discover** — Agent fetches `https://ucp-demo-1f0cf.web.app/.well-known/ucp`
2. **Authenticate** — Agent initiates OAuth at `/oauth/authorize`
3. **User Login** — User signs in with Google on the merchant's login page
4. **Token Exchange** — Agent receives auth code → exchanges for JWT at `/oauth/token`
5. **Shop** — Agent uses JWT to browse products, create checkout sessions, and place orders

### UCP API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.well-known/ucp` | GET | UCP discovery document |
| `/oauth/authorize` | GET | Start OAuth flow |
| `/oauth/token` | POST | Exchange code for JWT |
| `/api/products` | GET | List all products |
| `/api/products/:id` | GET | Get product details |
| `/api/checkout/sessions` | POST | Create checkout session |
| `/api/checkout/sessions/:id` | GET | Get session status |
| `/api/checkout/sessions/:id/update` | POST | Update session (items, buyer) |
| `/api/checkout/sessions/:id/complete` | POST | Complete checkout |
| `/api/orders` | GET | List user's orders |
| `/api/orders/:id` | GET | Get order details |

## License

MIT
