import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: npx tsx scripts/make-admin.ts <firebase-uid>");
  console.error("\nTo find your UID: sign into the app, then check Firebase Console → Authentication → Users");
  process.exit(1);
}

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function makeAdmin() {
  await db.collection("users").doc(uid).update({ role: "admin" });
  console.log(`User ${uid} is now an admin!`);
}

makeAdmin().catch(console.error);
