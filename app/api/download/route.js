import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'download';

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Validate URL (Security Allow-list)
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        return new NextResponse('Invalid url format', { status: 400 });
    }

    const allowedHosts = ['firebasestorage.googleapis.com', 'storage.googleapis.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
        return new NextResponse('URL not allowed', { status: 400 });
    }

    // Sanitize filename (remove illegal chars, limit length)
    const sanitizedName = name
        .replace(/[^a-zA-Z0-9 \-_]/g, '')
        .substring(0, 100)
        .trim() || 'audio_file';

    try {
        const upstreamRes = await fetch(url);

        if (!upstreamRes.ok) {
            return new NextResponse('Failed to fetch upstream file', { status: 502 });
        }

        const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';

        // Force browser download attachment
        const headers = new Headers({
            'Content-Disposition': `attachment; filename="${sanitizedName}.mp3"`,
            'Content-Type': contentType,
            'Cache-Control': 'no-store'
        });

        // Stream the body back to the client
        return new NextResponse(upstreamRes.body, { headers });
    } catch (error) {
        console.error('Proxy download error:', error);
        return new NextResponse('Internal server error', { status: 502 });
    }
}