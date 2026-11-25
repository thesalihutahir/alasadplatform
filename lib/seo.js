import { getAdminDb } from '@/lib/firebaseAdmin';

export const SITE_URL = 'https://www.alasadfoundation.org';
export const SITE_NAME = 'Al-Asad Education Foundation';
export const FALLBACK_IMAGE = `${SITE_URL}/fallback.webp`;

/** Turn a stored image value (absolute URL or site-relative path) into an absolute URL. */
export function absoluteImage(value) {
  if (!value || typeof value !== 'string') return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${SITE_URL}${value}`;
  return FALLBACK_IMAGE;
}

/**
 * Server-side document lookup for generateMetadata.
 * Returns { state: 'ok' | 'missing' | 'error', data? } so callers can tell a
 * genuinely missing record (-> 404) from an infrastructure failure (-> generic metadata).
 */
export async function getDocForMeta(collectionName, id) {
  if (!id || typeof id !== 'string' || id.includes('/') || id === '.' || id === '..') {
    return { state: 'missing' };
  }
  try {
    const snap = await getAdminDb().collection(collectionName).doc(id).get();
    return snap.exists ? { state: 'ok', data: snap.data() } : { state: 'missing' };
  } catch (err) {
    console.error(`Metadata lookup failed for ${collectionName}/${id}:`, err?.message || err);
    return { state: 'error' };
  }
}
