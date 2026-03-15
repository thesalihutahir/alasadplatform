import PlaylistsClientPage from './ClientPage';

export const runtime = 'nodejs';

// Metadata for SEO + social previews
export async function generateMetadata() {
  const imageUrl = 'https://www.alasadfoundation.org/fallback.webp';

  return {
    title: 'Video Playlists | Al-Asad Education Foundation',
    description:
      'Browse curated video series including Tafsir, lectures, seminars, and educational collections from Al-Asad Education Foundation.',
    openGraph: {
      title: 'Video Playlists | Al-Asad Education Foundation',
      description:
        'Explore organized video series and collections including Tafsir, lectures, and seminars.',
      url: 'https://www.alasadfoundation.org/media/videos/playlists',
      siteName: 'Al-Asad Education Foundation',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Video Playlists | Al-Asad Education Foundation',
      description:
        'Explore organized video series and collections from Al-Asad Education Foundation.',
      images: [imageUrl],
    },
  };
}

export default function Page() {
  return <PlaylistsClientPage />;
    }
