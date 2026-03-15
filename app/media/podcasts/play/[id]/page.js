import { adminDb } from '@/lib/firebaseAdmin';
import PodcastPlayClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    console.log("Fetching podcast metadata for ID:", id);

    const docRef = adminDb.collection('podcasts').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.error(`Metadata Error: Podcast ${id} not found in Firestore.`);
      return {
        title: 'Podcast Not Found | Al-Asad',
      };
    }

    const data = snap.data();
    const imageUrl = data.thumbnail || 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Education Foundation`,
      description: data.description || 'Listen to this podcast episode.',
      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/podcasts/play/${id}`,
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
    console.error("Podcast metadata fetch crashed:", err);
    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <PodcastPlayClientPage />;
    }
