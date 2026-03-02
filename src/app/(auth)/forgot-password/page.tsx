"use client";

import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: { error?: string; success?: boolean } | null,
      formData: FormData
    ) => {
      const result = await forgotPasswordAction(formData);
      return result ?? null;
    },
    null
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-slate-500">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              If an account with that email exists, a password reset link has
              been sent. Please check your inbox (and spam folder).
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
