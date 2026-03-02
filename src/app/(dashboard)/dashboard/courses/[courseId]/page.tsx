import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserProgressForCourse } from "@/actions/progress";
import { redirect, notFound } from "next/navigation";
import { VideoPlayer } from "@/components/features/video-player";
import { MarkCompleteButton } from "./_components/mark-complete-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Lock,
  Play,
} from "lucide-react";
import Link from "next/link";

interface CourseViewPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ video?: string }>;
}

export default async function CourseViewPage({
  params,
  searchParams,
}: CourseViewPageProps) {
  const { courseId } = await params;
  const { video: selectedVideoId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) redirect("/login");

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: dbUser.id,
        courseId,
      },
    },
  });

  if (!enrollment) redirect("/dashboard");

  // Get course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) notFound();

  // Get videos with progress
  const videosWithProgress = await getUserProgressForCourse(
    dbUser.id,
    courseId
  );

  // Determine which video to show
  const activeVideo = selectedVideoId
    ? videosWithProgress.find((v: { id: string }) => v.id === selectedVideoId)
    : videosWithProgress[0];

  if (!activeVideo) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
        <p className="text-slate-500">
          No videos have been added to this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Video Player */}
        <div className="space-y-4">
          {activeVideo.isUnlocked ? (
            <>
              <VideoPlayer
                youtubeUrl={activeVideo.youtubeUrl}
                title={activeVideo.title}
              />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {activeVideo.sequence}. {activeVideo.title}
                  </h2>
                </div>
                {!activeVideo.isCompleted && (
                  <MarkCompleteButton
                    videoId={activeVideo.id}
                    courseId={courseId}
                  />
                )}
                {activeVideo.isCompleted && (
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700"
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Completed
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100">
              <div className="text-center">
                <Lock className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  Complete the previous video to unlock this one
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Curriculum Sidebar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Curriculum</CardTitle>
            <p className="text-xs text-slate-500">
              {videosWithProgress.filter((v: { isCompleted: boolean }) => v.isCompleted).length}/
              {videosWithProgress.length} completed
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul>
              {videosWithProgress.map((video: { id: string; title: string; youtubeUrl: string; sequence: number; isCompleted: boolean; isUnlocked: boolean }) => {
                const isActive = video.id === activeVideo.id;
                const canAccess = video.isUnlocked;

                return (
                  <li key={video.id}>
                    {canAccess ? (
                      <Link
                        href={`/dashboard/courses/${courseId}?video=${video.id}`}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                          isActive
                            ? "bg-slate-50 border-l-2 border-slate-800"
                            : ""
                        }`}
                      >
                        <span className="shrink-0">
                          {video.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : isActive ? (
                            <CircleDot className="h-4 w-4 text-slate-800" />
                          ) : (
                            <Play className="h-4 w-4 text-slate-400" />
                          )}
                        </span>
                        <span
                          className={`truncate ${
                            isActive
                              ? "font-medium text-slate-800"
                              : "text-slate-600"
                          }`}
                        >
                          {video.sequence}. {video.title}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 text-sm opacity-50">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <span className="truncate text-slate-500">
                          {video.sequence}. {video.title}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
