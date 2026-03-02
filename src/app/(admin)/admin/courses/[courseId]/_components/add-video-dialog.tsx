"use client";

import { createVideoAction } from "@/actions/videos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface AddVideoDialogProps {
  courseId: string;
}

export function AddVideoDialog({ courseId }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createVideoAction({
        title: formData.get("title") as string,
        youtubeUrl: formData.get("youtubeUrl") as string,
        sequence: Number(formData.get("sequence")),
        courseId,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Video added successfully");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-slate-800 hover:bg-slate-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>
            Add a YouTube video to this course. Use an unlisted URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoTitle">Title</Label>
            <Input
              id="videoTitle"
              name="title"
              placeholder="e.g. Lesson 1: Getting Started"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sequence">Sequence Number</Label>
            <Input
              id="sequence"
              name="sequence"
              type="number"
              min={1}
              placeholder="1"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Video
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
