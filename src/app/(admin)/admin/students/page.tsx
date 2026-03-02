import { getStudentsAction } from "@/actions/students";
import { InviteStudentForm } from "./_components/invite-student-form";
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
import { Users } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await getStudentsAction();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Invite and manage student accounts
          </p>
        </div>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite a Student</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteStudentForm />
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-lg">
              All Students ({students.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No students yet. Invite your first student above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student: { id: string; email: string; requiresPasswordChange: boolean; createdAt: Date; _count: { enrollments: number } }) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-slate-800">
                      {student.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {student.id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.requiresPasswordChange
                            ? "secondary"
                            : "default"
                        }
                      >
                        {student.requiresPasswordChange
                          ? "Pending"
                          : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {student._count.enrollments}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(student.createdAt).toLocaleDateString()}
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
