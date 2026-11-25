import PodcastsClientPage from './ClientPage';
import { SITE_URL, FALLBACK_IMAGE } from '@/lib/seo';

const title = 'Podcasts | Al-Asad Education Foundation';
const description =
  'Listen to podcast shows and episodes from Al-Asad Education Foundation on Qur’anic studies, Islamic education and community development.';

export const metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/media/podcasts` },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/media/podcasts`,
    siteName: 'Al-Asad Education Foundation',
    images: [{ url: FALLBACK_IMAGE }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description, images: [FALLBACK_IMAGE] },
};

export default function Page() {
  return <PodcastsClientPage />;
}
