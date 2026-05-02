import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code      = searchParams.get("code");
  const next      = searchParams.get("next") ?? "/";
  const error     = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc ?? error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Auto-create profile on first OAuth sign-in
    if (data.user) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        const username =
          (data.user.user_metadata?.full_name as string | undefined) ??
          data.user.email?.split("@")[0] ??
          "user";

        await supabase.from("profiles").insert({
          id:         data.user.id,
          username,
          avatar_url: (data.user.user_metadata?.avatar_url as string | null) ?? null,
        });
      }
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocal       = process.env.NODE_ENV === "development";

    if (isLocal) return NextResponse.redirect(`${origin}${next}`);
    if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=Missing+auth+code`);
}
