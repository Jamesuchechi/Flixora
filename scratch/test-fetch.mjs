const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'bd6134f242a3794db2ca7f9b247edcd6';

const endpoints = [
  '/trending/all/day',
  '/movie/top_rated',
  '/tv/on_the_air',
  '/movie/popular',
  '/genre/movie/list'
];

async function test() {
  for (const endpoint of endpoints) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', API_KEY);
    console.log('Testing fetch to:', url.toString());
    try {
      const res = await fetch(url.toString());
      console.log(`${endpoint} -> Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`  Results count: ${data.results?.length ?? data.genres?.length}`);
      } else {
        const text = await res.text();
        console.log(`  Error: ${text}`);
      }
    } catch (err) {
      console.error(`Fetch failed for ${endpoint}:`, err);
    }
  }
}

test();
