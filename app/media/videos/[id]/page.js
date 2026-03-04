import { adminDb } from '@/lib/firebaseAdmin';
import WatchVideoClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  // ✅ MUST await params in Next.js 15
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    // Log the ID to Vercel logs so you can see it working
    console.log("Fetching metadata for ID:", id);

    const docRef = adminDb.collection('videos').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.error(`Metadata Error: Video ${id} not found in Firestore.`);
      return { title: 'Video Not Found | Al-Asad' };
    }

    const data = snap.data();
    const imageUrl = data.thumbnail || 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Education Foundation`,
      description: data.description || 'Watch this video.',
      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/videos/${id}`,
        images: [{ url: imageUrl }],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        images: [imageUrl],
      },
    };
  } catch (err) {
    // If you see this in your terminal/Vercel logs, the Private Key is likely wrong
    console.error("Metadata fetch crashed:", err);
    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <WatchVideoClientPage />;
}
