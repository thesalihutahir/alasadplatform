import { adminDb } from '@/lib/firebaseAdmin';
import WatchVideoClientPage from './ClientPage';

// ✅ Force Node runtime (required for firebase-admin)
export const runtime = 'nodejs';

// 1. GENERATE METADATA (Runs on Server for Social Media Previews)
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const docRef = adminDb.collection('videos').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        title: 'Video Not Found | Al-Asad Education Foundation',
      };
    }

    const data = snap.data();

    const imageUrl = data.thumbnail?.startsWith('http')
      ? data.thumbnail
      : 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Education Foundation`,
      description: data.description || 'Watch this video.',
      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/videos/${id}`,
        siteName: 'Al-Asad Education Foundation',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        ],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: data.description || '',
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {
      title: 'Video | Al-Asad Education Foundation',
    };
  }
}

// 2. RENDER PAGE
export default function Page() {
  return <WatchVideoClientPage />;
}