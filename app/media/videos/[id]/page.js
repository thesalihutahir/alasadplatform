import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import WatchVideoClientPage from './ClientPage'; // Ensure this points to your renamed ClientPage.js

// 1. GENERATE METADATA (Runs on Server for Social Media Previews)
export async function generateMetadata({ params }) {
  const id = params.id;

  try {
    const docRef = doc(db, "videos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        title: 'Video Not Found | Al-Asad Education Foundation',
        description: 'The video you are looking for does not exist.'
      };
    }

    const data = docSnap.data();
    
    // Prepare description (truncate if too long for SEO)
    const description = data.description 
      ? data.description.substring(0, 160) + (data.description.length > 160 ? '...' : '')
      : 'Watch this educational video from Al-Asad Education Foundation.';

    return {
      title: `${data.title} | Al-Asad Education Foundation`,
      description: description,
      openGraph: {
        title: data.title,
        description: description,
        siteName: 'Al-Asad Education Foundation',
        images: [
          {
            url: data.thumbnail || '/fallback.webp', // WhatsApp uses this image
            width: 1200,
            height: 630,
            alt: data.title,
          },
        ],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: description,
        images: [data.thumbnail || '/fallback.webp'],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Watch Video | Al-Asad Education Foundation',
    };
  }
}

// 2. RENDER PAGE (Passes control to Client Component)
export default function Page() {
  return <WatchVideoClientPage />;
}
