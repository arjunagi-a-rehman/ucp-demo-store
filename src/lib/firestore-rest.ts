/**
 * Firestore REST API helper.
 * Used instead of firebase-admin to avoid bundling issues on Firebase Cloud Functions.
 */
import crypto from "crypto";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ucp-demo-1f0cf";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token;
  }

  const saJson = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (!saJson) throw new Error("GCP_SERVICE_ACCOUNT_KEY not set");

  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const signInput = `${header}.${claim}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign.sign(sa.private_key, "base64url");
  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  }

  const tokenData = await tokenRes.json();
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };
  return cachedToken.token;
}

// Convert Firestore document fields to plain JS object
function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    return fromFirestoreFields(map.fields || {});
  }
  return null;
}

function fromFirestoreFields(fields: Record<string, Record<string, unknown>>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[k] = fromFirestoreValue(v);
  }
  return result;
}

export function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

// Parse a document response into a plain object with id
function parseDoc(doc: Record<string, unknown>): Record<string, unknown> | null {
  if (!doc.fields) return null;
  const name = doc.name as string;
  const id = name.split("/").pop()!;
  return { id, ...fromFirestoreFields(doc.fields as Record<string, Record<string, unknown>>) };
}

// --- Public API ---

export async function listDocs(
  collection: string,
  options?: { orderBy?: string; orderDirection?: "ASCENDING" | "DESCENDING"; where?: { field: string; op: string; value: unknown } }
): Promise<Record<string, unknown>[]> {
  const token = await getAccessToken();

  // Use structured query for ordering/filtering
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  };

  if (options?.orderBy) {
    structuredQuery.orderBy = [
      { field: { fieldPath: options.orderBy }, direction: options.orderDirection || "DESCENDING" },
    ];
  }

  if (options?.where) {
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: options.where.field },
        op: options.where.op,
        value: toFirestoreValue(options.where.value),
      },
    };
  }

  const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structuredQuery }),
  });

  if (!res.ok) {
    throw new Error(`Firestore query failed: ${await res.text()}`);
  }

  const results = await res.json();
  return results
    .filter((r: Record<string, unknown>) => r.document)
    .map((r: Record<string, unknown>) => parseDoc(r.document as Record<string, unknown>))
    .filter(Boolean) as Record<string, unknown>[];
}

export async function getDoc(collection: string, docId: string): Promise<Record<string, unknown> | null> {
  const token = await getAccessToken();
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore get failed: ${await res.text()}`);

  const doc = await res.json();
  return parseDoc(doc);
}

export async function setDoc(collection: string, docId: string, data: Record<string, unknown>): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  if (!res.ok) throw new Error(`Firestore write failed: ${await res.text()}`);
}

export async function updateDoc(collection: string, docId: string, data: Record<string, unknown>): Promise<void> {
  const token = await getAccessToken();
  const fieldPaths = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}?${fieldPaths}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  if (!res.ok) throw new Error(`Firestore update failed: ${await res.text()}`);
}
