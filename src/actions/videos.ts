"use server";

import { prisma } from "@/lib/prisma";
import { videoSchema, type VideoInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createVideoAction(input: VideoInput) {
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const video = await prisma.video.create({
      data: {
        title: parsed.data.title,
        youtubeUrl: parsed.data.youtubeUrl,
        sequence: parsed.data.sequence,
        courseId: parsed.data.courseId,
      },
    });

    revalidatePath("/admin");
    return { data: video };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "A video with that sequence number already exists in this course" };
    }
    return { error: "Failed to create video" };
  }
}

export async function updateVideoAction(
  id: string,
  input: Partial<VideoInput>
) {
  const parsed = videoSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const video = await prisma.video.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin");
    return { data: video };
  } catch {
    return { error: "Failed to update video" };
  }
}

export async function deleteVideoAction(id: string) {
  try {
    await prisma.video.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { error: "Failed to delete video" };
  }
}
