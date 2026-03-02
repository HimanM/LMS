"use client";

import { inviteStudentAction } from "@/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export function InviteStudentForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: { error?: string; success?: boolean; warning?: string } | null,
      formData: FormData
    ) => {
      const result = await inviteStudentAction(formData);
      return result;
    },
    null
  );

  useEffect(() => {
    if (state?.success && state?.warning) {
      toast.warning(state.warning);
      formRef.current?.reset();
    } else if (state?.success) {
      toast.success("Invitation sent successfully!");
      formRef.current?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-3">
      <Input
        name="email"
        type="email"
        placeholder="student@example.com"
        required
        className="max-w-sm"
      />
      <Button
        type="submit"
        className="bg-slate-800 hover:bg-slate-700"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send Invite
      </Button>
    </form>
  );
}
