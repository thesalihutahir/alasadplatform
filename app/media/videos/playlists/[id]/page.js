import { adminDb } from '@/lib/firebaseAdmin';
import PlaylistViewClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    console.log("Fetching playlist metadata for ID:", id);

    const docRef = adminDb.collection('video_playlists').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.error(`Metadata Error: Playlist ${id} not found in Firestore.`);
      return { title: 'Playlist Not Found | Al-Asad' };
    }

    const data = snap.data();
    const imageUrl = data.cover || 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Video Series`,
      description:
        data.description ||
        'Watch this video series from Al-Asad Education Foundation.',

      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/videos/playlists/${id}`,
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
    console.error("Playlist metadata fetch crashed:", err);

    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <PlaylistViewClientPage />;
    }
