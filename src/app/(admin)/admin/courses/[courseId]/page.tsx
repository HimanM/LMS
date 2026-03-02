import { getCourseWithVideosAction } from "@/actions/courses";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AddVideoDialog } from "./_components/add-video-dialog";
import { EnrollStudentDialog } from "./_components/enroll-student-dialog";
import { DeleteVideoButton } from "./_components/delete-video-button";
import { UnenrollButton } from "./_components/unenroll-button";
import { ArrowLeft, Video, Users } from "lucide-react";
import Link from "next/link";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCourseWithVideosAction(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-1 text-sm text-slate-500">
                {course.description}
              </p>
            )}
            <Badge
              className="mt-2"
              variant={course.isActive ? "default" : "secondary"}
            >
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Videos Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-lg">
              Videos ({course.videos.length})
            </CardTitle>
          </div>
          <AddVideoDialog courseId={course.id} />
        </CardHeader>
        <CardContent>
          {course.videos.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No videos yet. Add your first video above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>YouTube URL</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.videos.map((video: { id: string; sequence: number; title: string; youtubeUrl: string }) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium text-slate-500">
                      {video.sequence}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {video.title}
                    </TableCell>
                    <TableCell className="max-w-50 truncate text-sm text-slate-500">
                      {video.youtubeUrl}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteVideoButton videoId={video.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Students Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-lg">
              Enrolled Students ({course.enrollments.length})
            </CardTitle>
          </div>
          <EnrollStudentDialog courseId={course.id} />
        </CardHeader>
        <CardContent>
          {course.enrollments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No students enrolled yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.enrollments.map((enrollment: { id: string; userId: string; courseId: string; user: { email: string; createdAt: Date } }) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium text-slate-800">
                      {enrollment.user.email}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(enrollment.user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <UnenrollButton
                        userId={enrollment.userId}
                        courseId={course.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
