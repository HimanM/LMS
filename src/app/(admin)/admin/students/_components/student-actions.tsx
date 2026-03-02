"use client";

import { deleteStudentAction, resendInviteAction } from "@/actions/students";
import { ConfirmAction } from "@/components/features/confirm-action";
import { Button } from "@/components/ui/button";
import { MailPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StudentActionsProps {
  studentId: string;
  email: string;
  requiresPasswordChange: boolean;
}

export function StudentActions({
  studentId,
  email,
  requiresPasswordChange,
}: StudentActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Resend invite — only for pending (unverified) users */}
      {requiresPasswordChange && (
        <ConfirmAction
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              title="Resend invite"
            >
              <MailPlus className="h-4 w-4" />
            </Button>
          }
          title="Resend invitation"
          description={`Send a new invitation email to ${email}? You can only resend once every 30 minutes.`}
          actionLabel="Resend"
          variant="default"
          onConfirm={async () => {
            const result = await resendInviteAction(studentId);
            return result;
          }}
          onSuccess={() => toast.success("Invitation resent")}
        />
      )}

      {/* Delete student */}
      <ConfirmAction
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Delete student"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
        title="Delete student"
        description={`Permanently delete ${email}? This will remove their account, enrollments, and all progress data. This action cannot be undone.`}
        actionLabel="Delete"
        onConfirm={async () => {
          const result = await deleteStudentAction(studentId);
          return result;
        }}
        onSuccess={() => toast.success("Student deleted")}
      />
    </div>
  );
}
