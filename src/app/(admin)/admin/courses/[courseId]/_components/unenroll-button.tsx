"use client";

import { unenrollStudentAction } from "@/actions/students";
import { Button } from "@/components/ui/button";
import { Loader2, UserMinus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface UnenrollButtonProps {
  userId: string;
  courseId: string;
}

export function UnenrollButton({ userId, courseId }: UnenrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleUnenroll() {
    if (!confirm("Are you sure you want to remove this student?")) return;

    startTransition(async () => {
      const result = await unenrollStudentAction({ userId, courseId });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student removed from course");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUnenroll}
      disabled={isPending}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserMinus className="h-4 w-4" />
      )}
    </Button>
  );
}
