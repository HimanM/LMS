import Link from "next/link";
import { LogoutButton } from "@/components/features/logout-button";
import { GraduationCap, BookOpen, Users, Video } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800">LMS Admin</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <BookOpen className="mr-1.5 inline h-4 w-4" />
                Courses
              </Link>
              <Link
                href="/admin/videos"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Video className="mr-1.5 inline h-4 w-4" />
                Videos
              </Link>
              <Link
                href="/admin/students"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Users className="mr-1.5 inline h-4 w-4" />
                Students
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
