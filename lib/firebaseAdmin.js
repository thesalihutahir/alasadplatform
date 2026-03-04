import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  // 1. Remove wrapping quotes if Vercel added them
  const cleanKey = key.replace(/^['"]|['"]$/g, '');
  // 2. Replace literal '\n' strings with actual newline characters
  return cleanKey.replace(/\\n/g, '\n');
};

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const adminDb = getFirestore();
export { adminDb };
