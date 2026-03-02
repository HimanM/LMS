import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  videoCount: number;
  completedCount?: number;
  isActive?: boolean;
  href: string;
}

export function CourseCard({
  title,
  description,
  videoCount,
  completedCount,
  isActive,
  href,
}: CourseCardProps) {
  const progress =
    videoCount > 0 && completedCount !== undefined
      ? Math.round((completedCount / videoCount) * 100)
      : null;

  return (
    <Link href={href} className="group block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-slate-600 transition-colors">
              {title}
            </CardTitle>
            {isActive !== undefined && (
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
          {description && (
            <CardDescription className="line-clamp-2 text-slate-500">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {videoCount} video{videoCount !== 1 ? "s" : ""}
            </span>
            {progress !== null && (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {progress}% complete
              </span>
            )}
          </div>
          {progress !== null && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
