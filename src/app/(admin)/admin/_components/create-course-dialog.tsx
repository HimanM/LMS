"use client";

import { createCourseAction } from "@/actions/courses";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCourseAction({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        isActive: true,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Course created successfully");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700">
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Add a new course to your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseTitle">Title</Label>
            <Input
              id="courseTitle"
              name="title"
              placeholder="e.g. Introduction to React"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseDesc">Description (optional)</Label>
            <Textarea
              id="courseDesc"
              name="description"
              placeholder="Brief description of the course..."
              rows={3}
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
              Create Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
