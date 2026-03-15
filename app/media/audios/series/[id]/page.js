import { adminDb } from '@/lib/firebaseAdmin';
import ViewSeriesClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    console.log("Fetching audio series metadata for ID:", id);

    const docRef = adminDb.collection('audio_series').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.error(`Metadata Error: Audio series ${id} not found in Firestore.`);
      return { title: 'Series Not Found | Al-Asad' };
    }

    const data = snap.data();
    const imageUrl = data.cover || 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Audio Series`,
      description:
        data.description ||
        'Listen to this audio series from Al-Asad Education Foundation.',

      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/audios/series/${id}`,
        images: [{ url: imageUrl }],
        type: 'website',
      },

      twitter: {
        card: 'summary_large_image',
        title: data.title,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error("Audio series metadata fetch crashed:", err);

    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <ViewSeriesClientPage />;
}