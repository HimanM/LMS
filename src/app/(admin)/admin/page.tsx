import { getCoursesAction } from "@/actions/courses";
import { CreateCourseDialog } from "./_components/create-course-dialog";
import { DeleteCourseButton } from "./_components/delete-course-button";
import { CourseCard } from "@/components/features/course-card";
import { BookOpen } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await getCoursesAction();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your course catalog
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16">
          <BookOpen className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-800">
            No courses yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Create your first course to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              videoCount={course._count.videos}
              isActive={course.isActive}
              href={`/admin/courses/${course.id}`}
              actions={
                <DeleteCourseButton
                  courseId={course.id}
                  courseTitle={course.title}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
