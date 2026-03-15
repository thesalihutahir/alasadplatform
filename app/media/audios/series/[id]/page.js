import ClientPage from "./ClientPage";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getSeries(id) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/audio_series/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const fields = data.fields || {};

    return {
      title: fields.title?.stringValue || "",
      description: fields.description?.stringValue || "",
      cover: fields.cover?.stringValue || ""
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const series = await getSeries(params.id);

  if (!series) {
    return {
      title: "Audio Series",
      description: "Listen to audio series"
    };
  }

  const title = `${series.title} | Audio Series`;
  const description =
    series.description || "Browse and listen to this audio series.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: series.cover ? [series.cover] : []
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: series.cover ? [series.cover] : []
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
