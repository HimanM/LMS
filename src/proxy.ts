import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — MUST be called before reading user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Public paths ──────────────────────────────────────
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/set-password");
  const isAuthCallback = pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/confirm");

  // Allow auth callback to pass through always
  if (isAuthCallback) {
    return supabaseResponse;
  }

  // ── Unauthenticated → /login ────────────────────────
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Authenticated on auth page → redirect away ──────
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    // We read user metadata for role; if we can't, default to dashboard
    const role = user.user_metadata?.role as string | undefined;
    url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── requiresPasswordChange lock ─────────────────────
  if (user) {
    const requiresPasswordChange =
      user.user_metadata?.requiresPasswordChange ?? false;

    if (requiresPasswordChange && pathname !== "/set-password") {
      const url = request.nextUrl.clone();
      url.pathname = "/set-password";
      return NextResponse.redirect(url);
    }

    // If password already set, don't let them visit /set-password
    if (!requiresPasswordChange && pathname === "/set-password") {
      const url = request.nextUrl.clone();
      const role = user.user_metadata?.role as string | undefined;
      url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ── Role-based access control ───────────────────────
  if (user && pathname.startsWith("/admin")) {
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser favicon)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
