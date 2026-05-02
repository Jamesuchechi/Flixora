import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const API_KEY  = process.env.TMDB_API_KEY  ?? '';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const endpoint  = '/' + route.join('/');
  const search    = req.nextUrl.searchParams.toString();
  const url       = `${BASE_URL}${endpoint}?api_key=${API_KEY}${search ? `&${search}` : ''}`;

  try {
    const res  = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: 'TMDB request failed' }, { status: 500 });
  }
}
