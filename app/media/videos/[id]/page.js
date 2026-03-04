import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import WatchVideoClientPage from './ClientPage'; // Ensure this points to your renamed ClientPage.js

// 1. GENERATE METADATA (Runs on Server for Social Media Previews)
export async function generateMetadata() {
  return {
    title: "Test Title | Al-Asad Education Foundation",
    description: "This is a test description.",
    openGraph: {
      title: "Test OG Title",
      description: "Test OG Description",
      url: "https://www.alasadfoundation.org/media/videos/test",
      siteName: "Al-Asad Education Foundation",
      images: [
        {
          url: "https://www.alasadfoundation.org/fallback.webp",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Test Twitter Title",
      description: "Test Twitter Description",
      images: ["https://www.alasadfoundation.org/fallback.webp"],
    },
  };
}

// 2. RENDER PAGE (Passes control to Client Component)
export default function Page() {
  return <WatchVideoClientPage />;
}
