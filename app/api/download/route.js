import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXTENSIONS = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/aac': 'aac',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/flac': 'flac',
};

/** True only for objects inside this project's own Storage bucket. */
function isOwnBucketUrl(parsedUrl, bucket) {
    if (parsedUrl.protocol !== 'https:') return false;
    const path = parsedUrl.pathname;
    if (parsedUrl.hostname === 'firebasestorage.googleapis.com') {
        return path.startsWith(`/v0/b/${bucket}/o/`);
    }
    if (parsedUrl.hostname === 'storage.googleapis.com') {
        return path.startsWith(`/${bucket}/`);
    }
    return false;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'download';

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) {
        return new NextResponse('Storage not configured', { status: 500 });
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        return new NextResponse('Invalid url format', { status: 400 });
    }

    // Only proxy files that live in our own bucket (not any public bucket on Google Cloud).
    if (!isOwnBucketUrl(parsedUrl, bucket)) {
        return new NextResponse('URL not allowed', { status: 400 });
    }

    // Keep letters/numbers in any script (incl. Arabic); drop control chars, quotes and path separators.
    const cleanName = name
        .normalize('NFC')
        .replace(/[\u0000-\u001F\u007F"\\/:*?<>|;%]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 100)
        .trim() || 'audio_file';

    try {
        // Do not follow redirects: a redirect could point outside the allow-listed bucket.
        const upstreamRes = await fetch(parsedUrl.toString(), { redirect: 'manual' });

        if (!upstreamRes.ok) {
            return new NextResponse('Failed to fetch upstream file', { status: 502 });
        }

        const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
        const mime = contentType.split(';')[0].trim().toLowerCase();

        // Prefer the real file type; fall back to the original object's extension, then mp3.
        const pathExt = decodeURIComponent(parsedUrl.pathname).match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase();
        const ext = EXTENSIONS[mime] || pathExt || 'mp3';
        const fileName = `${cleanName}.${ext}`;
        const asciiFallback = (cleanName.replace(/[^\x20-\x7E]/g, '').trim() || 'audio_file') + `.${ext}`;

        const headers = new Headers({
            'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Content-Type': contentType,
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        });

        const length = upstreamRes.headers.get('content-length');
        if (length) headers.set('Content-Length', length);

        return new NextResponse(upstreamRes.body, { headers });
    } catch (error) {
        console.error('Proxy download error:', error);
        return new NextResponse('Internal server error', { status: 502 });
    }
}
