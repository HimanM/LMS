"use client";

import { deleteCourseAction } from "@/actions/courses";
import { ConfirmAction } from "@/components/features/confirm-action";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCourseButtonProps {
  courseId: string;
  courseTitle: string;
  /** If true, redirects to /admin after deleting (use on detail page). */
  redirectAfter?: boolean;
}

export function DeleteCourseButton({
  courseId,
  courseTitle,
  redirectAfter = false,
}: DeleteCourseButtonProps) {
  const router = useRouter();

  return (
    <ConfirmAction
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Delete course"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="Delete course"
      description={`Permanently delete "${courseTitle}"? This will also delete all its videos, enrollments, and student progress. This action cannot be undone.`}
      actionLabel="Delete"
      onConfirm={async () => {
        const result = await deleteCourseAction(courseId);
        return result;
      }}
      onSuccess={() => {
        toast.success("Course deleted");
        if (redirectAfter) {
          router.push("/admin");
        }
      }}
    />
  );
}
