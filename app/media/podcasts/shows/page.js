import PodcastShowsClientPage from './ClientPage';
import { SITE_URL, FALLBACK_IMAGE } from '@/lib/seo';

const title = 'Podcast Shows | Al-Asad Education Foundation';
const description = 'Browse all podcast shows from Al-Asad Education Foundation.';

export const metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/media/podcasts/shows` },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/media/podcasts/shows`,
    siteName: 'Al-Asad Education Foundation',
    images: [{ url: FALLBACK_IMAGE }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description, images: [FALLBACK_IMAGE] },
};

export default function Page() {
  return <PodcastShowsClientPage />;
}
