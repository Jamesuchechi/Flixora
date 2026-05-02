import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const API_KEY  = process.env.TMDB_API_KEY ?? '';

/**
 * Proxy route for TMDB requests to avoid exposing API keys on the client.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  // Construct the TMDB URL
  const endpoint = `/${route.join('/')}`;
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Copy all incoming search params
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  
  // Add the private API key
  url.searchParams.set('api_key', API_KEY);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TMDB API error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
