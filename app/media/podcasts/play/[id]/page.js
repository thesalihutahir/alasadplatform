import { notFound } from 'next/navigation';
import PodcastPlayClientPage from './ClientPage';
import { getDocForMeta, absoluteImage, SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getDocForMeta('podcasts', id);

  if (result.state === 'missing') notFound();
  if (result.state === 'error') return { title: 'Al-Asad Education Foundation' };

  const data = result.data;
  const title = data.title || 'Podcast Episode';
  const description = data.description || 'Listen to this podcast episode.';
  const image = absoluteImage(data.thumbnail);
  const url = `${SITE_URL}/media/podcasts/play/${id}`;

  return {
    title: `${title} | Al-Asad Education Foundation`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Al-Asad Education Foundation',
      images: [{ url: image }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function Page() {
  return <PodcastPlayClientPage />;
}
