import { adminDb } from '@/lib/firebaseAdmin';
import WatchVideoClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  // ✅ FIX 1: Await params (Required for Next.js 15+)
  const { id } = await params;

  try {
    const docRef = adminDb.collection('videos').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.log(`Metadata Error: Video ID ${id} not found in Firestore.`);
      return {
        title: 'Video Not Found | Al-Asad Education Foundation',
      };
    }

    const data = snap.data();

    // ✅ FIX 2: Ensure absolute image URL
    // WhatsApp/Twitter often reject relative paths.
    const imageUrl = data.thumbnail && data.thumbnail.startsWith('http')
      ? data.thumbnail
      : 'https://www.alasadfoundation.org/fallback.webp';

    const pageUrl = `https://www.alasadfoundation.org/media/videos/${id}`;
    const cleanDescription = data.description 
      ? data.description.substring(0, 160).replace(/\n/g, ' ') 
      : 'Watch this video from Al-Asad Education Foundation.';

    return {
      title: `${data.title} | Al-Asad Education Foundation`,
      description: cleanDescription,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title: data.title,
        description: cleanDescription,
        url: pageUrl,
        siteName: 'Al-Asad Education Foundation',
        locale: 'en_US',
        type: 'video.other',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: data.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: cleanDescription,
        images: [imageUrl],
      },
    };
  } catch (err) {
    // This console error will show up in your terminal or Vercel logs
    console.error("Critical Metadata Fetch Error:", err);
    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <WatchVideoClientPage />;
}
