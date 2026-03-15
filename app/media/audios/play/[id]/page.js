import { adminDb } from '@/lib/firebaseAdmin';
import AudioPlayClientPage from './ClientPage';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  try {
    console.log("Fetching audio metadata for ID:", id);

    const docRef = adminDb.collection('audios').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.error(`Metadata Error: Audio ${id} not found.`);
      return { title: 'Audio Not Found | Al-Asad' };
    }

    const data = snap.data();
    const imageUrl =
      data.thumbnail || 'https://www.alasadfoundation.org/fallback.webp';

    return {
      title: `${data.title} | Al-Asad Audio Library`,
      description:
        data.description ||
        `Listen to this audio lecture by ${data.speaker || 'Al-Asad Education Foundation'}.`,

      openGraph: {
        title: data.title,
        description: data.description || '',
        url: `https://www.alasadfoundation.org/media/audios/play/${id}`,
        images: [{ url: imageUrl }],
        type: 'music.song',
      },

      twitter: {
        card: 'summary_large_image',
        title: data.title,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error("Audio metadata fetch crashed:", err);

    return {
      title: 'Al-Asad Education Foundation',
    };
  }
}

export default function Page() {
  return <AudioPlayClientPage />;
    }
