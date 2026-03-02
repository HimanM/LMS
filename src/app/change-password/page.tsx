"use client";

import { changePasswordAction } from "@/actions/auth";
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
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ChangePasswordPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: { error?: string; success?: boolean } | null,
      formData: FormData
    ) => {
      const result = await changePasswordAction(formData);
      return result ?? null;
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Password changed successfully!");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="mx-auto max-w-md py-8 px-4">
      <Link
        href="javascript:history.back()"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                Password changed successfully!
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                required
                minLength={8}
                autoComplete="new-password"
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
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
