import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { join } from "path";

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Try env var first (single-line JSON)
  const envKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (envKey && envKey.trim().length > 2) {
    return initializeApp({
      credential: cert(JSON.parse(envKey)),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Try loading from Service_Account.json file in project root
  try {
    const filePath = join(process.cwd(), "Service_Account.json");
    const serviceAccount = JSON.parse(readFileSync(filePath, "utf8"));
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch {
    // Fallback: no credentials
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let adminApp: ReturnType<typeof initializeApp>;
let adminDb: ReturnType<typeof getFirestore>;
let adminAuth: ReturnType<typeof getAuth>;
let adminStorage: ReturnType<typeof getStorage>;

try {
  adminApp = getAdminApp();
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  adminStorage = getStorage(adminApp);
} catch (error) {
  console.warn("Firebase Admin SDK init failed:", error);
  const errMsg = "Firebase Admin not initialized. Place Service_Account.json in project root or set GCP_SERVICE_ACCOUNT_KEY in .env.local";
  adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
    get: () => () => { throw new Error(errMsg); }
  });
  adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
    get: () => () => { throw new Error(errMsg); }
  });
  adminStorage = new Proxy({} as ReturnType<typeof getStorage>, {
    get: () => () => { throw new Error(errMsg); }
  });
}

export { adminDb, adminAuth, adminStorage };
export default adminApp!;
