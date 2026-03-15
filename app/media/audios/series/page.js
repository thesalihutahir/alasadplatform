import AllSeriesClientPage from './ClientPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Audio Series | Al-Asad Education Foundation',
  description:
    'Browse all audio series from Al-Asad Education Foundation, including Tafsir, lectures, and structured learning playlists.',
  openGraph: {
    title: 'Audio Series | Al-Asad Education Foundation',
    description:
      'Browse all audio series from Al-Asad Education Foundation.',
    url: 'https://www.alasadfoundation.org/media/audios/series',
    images: [
      {
        url: 'https://www.alasadfoundation.org/images/heroes/media-audios-hero.webp',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audio Series | Al-Asad Education Foundation',
    images: [
      'https://www.alasadfoundation.org/images/heroes/media-audios-hero.webp',
    ],
  },
};

export default function Page() {
  return <AllSeriesClientPage />;
    }
