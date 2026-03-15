import VideosClientPage from './ClientPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Video Library | Al-Asad Education Foundation',
  description:
    'Browse the Al-Asad Education Foundation video library. Watch lectures, sermons, and educational recordings in English, Hausa, and Arabic.',

  openGraph: {
    title: 'Video Library | Al-Asad Education Foundation',
    description:
      'Curated lectures, sermons, and educational recordings from Al-Asad Education Foundation.',
    url: 'https://www.alasadfoundation.org/media/videos',
    images: [
      {
        url: 'https://www.alasadfoundation.org/images/heroes/media-videos-hero.webp',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Video Library | Al-Asad Education Foundation',
    images: [
      'https://www.alasadfoundation.org/images/heroes/media-videos-hero.webp',
    ],
  },
};

export default function Page() {
  return <VideosClientPage />;
    }
