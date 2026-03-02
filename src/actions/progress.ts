"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { markCompleteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function markVideoCompleteAction(input: {
  videoId: string;
  courseId: string;
}) {
  const parsed = markCompleteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Look up the Prisma user
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    return { error: "User not found" };
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: dbUser.id,
        courseId: parsed.data.courseId,
      },
    },
  });

  if (!enrollment) {
    return { error: "You are not enrolled in this course" };
  }

  // Get the current video to verify it exists and get its sequence
  const currentVideo = await prisma.video.findUnique({
    where: { id: parsed.data.videoId },
    include: { course: true },
  });

  if (!currentVideo || currentVideo.courseId !== parsed.data.courseId) {
    return { error: "Video not found in this course" };
  }

  // Validate sequential progress — ensure all previous videos are completed
  if (currentVideo.sequence > 1) {
    const previousVideos = await prisma.video.findMany({
      where: {
        courseId: parsed.data.courseId,
        sequence: { lt: currentVideo.sequence },
      },
      orderBy: { sequence: "asc" },
    });

    const completedVideos = await prisma.userProgress.findMany({
      where: {
        userId: dbUser.id,
        videoId: { in: previousVideos.map((v: { id: string }) => v.id) },
        isCompleted: true,
      },
    });

    if (completedVideos.length !== previousVideos.length) {
      return { error: "You must complete previous videos first" };
    }
  }

  // Mark as complete
  await prisma.userProgress.upsert({
    where: {
      userId_videoId: {
        userId: dbUser.id,
        videoId: parsed.data.videoId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId: dbUser.id,
      videoId: parsed.data.videoId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/courses/${parsed.data.courseId}`);

  // Find the next video in the sequence
  const nextVideo = await prisma.video.findFirst({
    where: {
      courseId: parsed.data.courseId,
      sequence: currentVideo.sequence + 1,
    },
  });

  return {
    success: true,
    nextVideoId: nextVideo?.id ?? null,
  };
}

export async function getUserProgressForCourse(
  userId: string,
  courseId: string
) {
  const videos = await prisma.video.findMany({
    where: { courseId },
    orderBy: { sequence: "asc" },
  });

  const progress = await prisma.userProgress.findMany({
    where: {
      userId,
      videoId: { in: videos.map((v: { id: string }) => v.id) },
    },
  });

  const progressMap = new Map<string, boolean>(
    progress.map((p: { videoId: string; isCompleted: boolean }) => [p.videoId, p.isCompleted])
  );

  return videos.map((video: { id: string; title: string; youtubeUrl: string; sequence: number; courseId: string }, index: number) => {
    const isCompleted = progressMap.get(video.id) ?? false;

    // Video is unlocked if it's the first one, or if the previous video is completed
    let isUnlocked = false;
    if (index === 0) {
      isUnlocked = true;
    } else {
      const prevVideoId = videos[index - 1]!.id;
      isUnlocked = progressMap.get(prevVideoId) ?? false;
    }

    return {
      ...video,
      isCompleted,
      isUnlocked,
    };
  });
}
