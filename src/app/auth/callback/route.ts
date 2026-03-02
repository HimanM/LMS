import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles the PKCE code-exchange flow (Supabase sends ?code=...).
 * Invite / magic-link flows use hash fragments (#access_token=...),
 * which never reach the server — those are handled by the client-side
 * confirm page at /auth/confirm.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/set-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // No code param → might be a hash-fragment flow that reached the wrong
  // endpoint. Redirect to the client-side confirm page, preserving the
  // original query string so the hash stays intact on the browser side.
  return NextResponse.redirect(
    `${origin}/auth/confirm?${searchParams.toString()}`
  );
}
