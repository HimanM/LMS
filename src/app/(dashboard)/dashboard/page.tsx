import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/features/course-card";
import { BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) redirect("/login");

  // Get enrolled courses with progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: dbUser.id },
    include: {
      course: {
        include: {
          videos: true,
          _count: { select: { videos: true } },
        },
      },
    },
  });

  // Calculate completion for each course
  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment: { course: { id: string; title: string; description: string | null; isActive: boolean; videos: { id: string }[]; _count: { videos: number } } }) => {
      const completedCount = await prisma.userProgress.count({
        where: {
          userId: dbUser.id,
          videoId: { in: enrollment.course.videos.map((v: { id: string }) => v.id) },
          isCompleted: true,
        },
      });

      return {
        ...enrollment.course,
        completedCount,
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Continue learning from where you left off
        </p>
      </div>

      {coursesWithProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16">
          <BookOpen className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-800">
            No courses yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            You haven&apos;t been enrolled in any courses yet. Please contact
            your administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coursesWithProgress.map((course: { id: string; title: string; description: string | null; _count: { videos: number }; completedCount: number }) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              videoCount={course._count.videos}
              completedCount={course.completedCount}
              href={`/dashboard/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
