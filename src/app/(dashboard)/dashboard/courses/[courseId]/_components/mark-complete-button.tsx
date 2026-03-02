"use client";

import { markVideoCompleteAction } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
  videoId: string;
  courseId: string;
}

export function MarkCompleteButton({
  videoId,
  courseId,
}: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleMarkComplete() {
    startTransition(async () => {
      const result = await markVideoCompleteAction({ videoId, courseId });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Video marked as complete!");

      // Navigate to next video if available
      if (result.nextVideoId) {
        router.push(
          `/dashboard/courses/${courseId}?video=${result.nextVideoId}`
        );
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={isPending}
      className="bg-slate-800 hover:bg-slate-700"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      )}
      Mark as Complete
    </Button>
  );
}
