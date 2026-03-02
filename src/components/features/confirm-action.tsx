"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

interface ConfirmActionProps {
  /** The trigger element (usually a button) */
  trigger: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  /** Called when the user confirms. Return { error } to show a toast. */
  onConfirm: () => Promise<{ error?: string; success?: boolean }>;
  onSuccess?: () => void;
  variant?: "destructive" | "default";
}

export function ConfirmAction({
  trigger,
  title,
  description,
  actionLabel = "Continue",
  onConfirm,
  onSuccess,
  variant = "destructive",
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        onSuccess?.();
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
