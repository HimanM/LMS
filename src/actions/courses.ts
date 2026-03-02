"use server";

import { prisma } from "@/lib/prisma";
import { courseSchema, type CourseInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createCourseAction(input: CourseInput) {
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const course = await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        isActive: parsed.data.isActive,
      },
    });

    revalidatePath("/admin");
    return { data: course };
  } catch {
    return { error: "Failed to create course" };
  }
}

export async function updateCourseAction(
  id: string,
  input: Partial<CourseInput>
) {
  const parsed = courseSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin");
    return { data: course };
  } catch {
    return { error: "Failed to update course" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { error: "Failed to delete course" };
  }
}

export async function getCoursesAction() {
  return prisma.course.findMany({
    include: {
      _count: {
        select: { videos: true, enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseWithVideosAction(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      videos: { orderBy: { sequence: "asc" } },
      enrollments: {
        include: { user: true },
      },
    },
  });
}
