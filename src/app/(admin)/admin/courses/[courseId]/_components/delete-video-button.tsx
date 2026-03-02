"use client";

import { deleteVideoAction } from "@/actions/videos";
import { ConfirmAction } from "@/components/features/confirm-action";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteVideoButtonProps {
  videoId: string;
  videoTitle?: string;
}

export function DeleteVideoButton({ videoId, videoTitle }: DeleteVideoButtonProps) {
  return (
    <ConfirmAction
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Delete video"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="Delete video"
      description={`Permanently delete${videoTitle ? ` "${videoTitle}"` : " this video"}? Student progress for this video will also be deleted. This cannot be undone.`}
      actionLabel="Delete"
      onConfirm={async () => {
        const result = await deleteVideoAction(videoId);
        return result;
      }}
      onSuccess={() => toast.success("Video deleted")}
    />
  );
}
