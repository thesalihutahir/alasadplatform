import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  // 1. Remove wrapping quotes if Vercel added them
  const cleanKey = key.replace(/^['"]|['"]$/g, '');
  // 2. Replace literal '\n' strings with actual newline characters
  return cleanKey.replace(/\\n/g, '\n');
};

function ensureAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  }
}

/**
 * Lazily initialises the Admin SDK on first use, so a missing or invalid
 * credential only fails the code path that needs it (and can be caught there)
 * instead of crashing every route that merely imports this module.
 */
export function getAdminDb() {
  ensureAdminApp();
  return getFirestore();
}

/**
 * Backwards-compatible export: existing code does `adminDb.collection(...)`.
 * The proxy defers initialisation until the first property access.
 */
export const adminDb = new Proxy(
  {},
  {
    get(_target, prop) {
      const db = getAdminDb();
      const value = db[prop];
      return typeof value === 'function' ? value.bind(db) : value;
    },
  }
);
