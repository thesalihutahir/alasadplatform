import AudiosClientPage from './ClientPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Audio Library | Al-Asad Education Foundation',
  description:
    'Listen to sermons, tafsir, and educational audio series from Al-Asad Education Foundation, organized by language and topic.',
  openGraph: {
    title: 'Audio Library | Al-Asad Education Foundation',
    description:
      'Explore our collection of audio series, lectures, and structured learning playlists.',
    url: 'https://www.alasadfoundation.org/media/audios',
    images: [
      {
        url: 'https://www.alasadfoundation.org/images/heroes/media-audios-hero.webp',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audio Library | Al-Asad Education Foundation',
    images: [
      'https://www.alasadfoundation.org/images/heroes/media-audios-hero.webp',
    ],
  },
};

export default function Page() {
  return <AudiosClientPage />;
    }
