import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase environment variables are missing.');
    // We throw a descriptive error which Next.js will catch and show as a 500
    // but at least it will be logged on the server.
    throw new Error('Supabase configuration missing');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll:  ()         => cookieStore.getAll(),
        setAll:  (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — mutations ignored
          }
        },
      },
    }
  );
};
