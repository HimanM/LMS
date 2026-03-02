"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Client-side page that handles Supabase invite / magic-link redirects.
 *
 * Supabase appends tokens as a hash fragment (#access_token=...) which
 * is never sent to the server. We parse the fragment manually and call
 * setSession() to establish the authenticated session.
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // Parse the hash fragment: #access_token=...&refresh_token=...
      const hash = window.location.hash.substring(1); // remove '#'
      if (!hash) {
        setError("No authentication data found in the URL.");
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError("Invalid invite link — missing tokens.");
        return;
      }

      const supabase = createClient();

      // Manually set the session from the hash fragment tokens
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error("[auth/confirm] setSession error:", sessionError);
        setError(sessionError.message);
        return;
      }

      if (!data.session) {
        setError("Unable to verify the link. It may have expired.");
        return;
      }

      // Check the link type from the hash fragment
      const type = params.get("type"); // "invite" | "recovery" | etc.

      if (type === "recovery") {
        // Password reset flow → send to reset-password page
        router.replace("/reset-password");
        return;
      }

      // Invite flow → redirect based on user metadata
      const metadata = data.session.user.user_metadata;
      const requiresPasswordChange = metadata?.requiresPasswordChange ?? false;
      if (requiresPasswordChange) {
        router.replace("/set-password");
      } else {
        const role = metadata?.role as string | undefined;
        router.replace(role === "ADMIN" ? "/admin" : "/dashboard");
      }
    };

    handleAuth();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-slate-600 underline hover:text-slate-800"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-sm text-slate-500">Verifying your invitation…</p>
      </div>
    </div>
  );
}
