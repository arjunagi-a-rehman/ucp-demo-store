import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load service account from env or file
let serviceAccount: Record<string, string>;
const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (envKey && envKey.trim().length > 2) {
  serviceAccount = JSON.parse(envKey);
} else {
  try {
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const filePath = join(scriptDir, "..", "Service_Account.json");
    serviceAccount = JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    console.error("Place Service_Account.json in the project root, or set FIREBASE_SERVICE_ACCOUNT_KEY env variable");
    process.exit(1);
  }
}

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life. Perfect for travel and focus work.",
    price: 199.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    inventory: 50,
    sku: "ELEC-HP-001",
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable everyday tee made from 100% organic cotton. Available in classic white with a relaxed fit.",
    price: 29.99,
    category: "fashion",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    inventory: 200,
    sku: "FASH-TS-001",
  },
  {
    name: "Smart Home Speaker",
    description: "Voice-controlled smart speaker with premium 360-degree sound. Works with all major voice assistants.",
    price: 89.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1543512214-318228f83599?w=500&q=80",
    inventory: 75,
    sku: "ELEC-SP-001",
  },
  {
    name: "Leather Messenger Bag",
    description: "Handcrafted genuine leather messenger bag with padded laptop compartment. Fits up to 15-inch laptops.",
    price: 149.99,
    category: "fashion",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    inventory: 30,
    sku: "FASH-BG-001",
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled vacuum insulated bottle. Keeps drinks cold for 24 hours or hot for 12 hours. 750ml capacity.",
    price: 34.99,
    category: "home",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
    inventory: 150,
    sku: "HOME-WB-001",
  },
  {
    name: "Running Shoes",
    description: "Lightweight performance running shoes with responsive cushioning and breathable mesh upper.",
    price: 119.99,
    category: "fashion",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    inventory: 60,
    sku: "FASH-SH-001",
  },
  {
    name: "Mechanical Keyboard",
    description: "Full-size mechanical keyboard with Cherry MX switches, RGB backlighting, and USB-C connectivity.",
    price: 129.99,
    category: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80",
    inventory: 40,
    sku: "ELEC-KB-001",
  },
  {
    name: "Scented Candle Set",
    description: "Set of 3 hand-poured soy wax candles in lavender, vanilla, and cedar. 40-hour burn time each.",
    price: 24.99,
    category: "home",
    imageUrl: "https://images.unsplash.com/photo-1602607283766-b4214f23b264?w=500&q=80",
    inventory: 100,
    sku: "HOME-CN-001",
  },
];

async function seed() {
  console.log("Seeding products...");
  for (const product of products) {
    const docRef = await db.collection("products").add({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  Seeded: ${product.name} (${docRef.id})`);
  }
  console.log("\nDone! Seeded", products.length, "products.");
}

seed().catch(console.error);
