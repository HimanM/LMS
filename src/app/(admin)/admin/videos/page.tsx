import { prisma } from "@/lib/prisma";
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
import { Video } from "lucide-react";
import Link from "next/link";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    include: { course: true },
    orderBy: [{ course: { title: "asc" } }, { sequence: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Videos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of all videos across courses. Manage videos within each{" "}
          <Link href="/admin" className="underline hover:text-slate-800">
            course
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-lg">
              Videos ({videos.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No videos have been added yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>YouTube URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video: { id: string; sequence: number; title: string; youtubeUrl: string; courseId: string; course: { title: string } }) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <Link
                        href={`/admin/courses/${video.courseId}`}
                        className="font-medium text-slate-800 hover:underline"
                      >
                        {video.course.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {video.sequence}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {video.title}
                    </TableCell>
                    <TableCell className="max-w-50 truncate text-sm text-slate-500">
                      {video.youtubeUrl}
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
