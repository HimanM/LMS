"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";
import { inviteStudentSchema, enrollStudentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function inviteStudentAction(formData: FormData) {
  const parsed = inviteStudentSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email;

  try {
    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A student with this email already exists" };
    }

    // Use Supabase Admin API to generate an invite link
    const supabaseAdmin = await createAdminClient();
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          data: {
            role: "STUDENT",
            requiresPasswordChange: true,
          },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        },
      });

    if (inviteError) {
      return { error: inviteError.message };
    }

    // Create user in Prisma
    await prisma.user.create({
      data: {
        id: inviteData.user.id,
        email,
        role: "STUDENT",
        requiresPasswordChange: true,
      },
    });

    // Send welcome email via Resend
    const inviteLink =
      inviteData.properties?.action_link ??
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Welcome to the Learning Management System",
      react: WelcomeEmail({ inviteLink, email }),
    });

    if (emailError) {
      console.error("[invite] Email send failed:", emailError);
      // User was created successfully — return partial success so the
      // admin can resend the invite later instead of a confusing error.
      revalidatePath("/admin");
      return {
        success: true,
        warning:
          "Student account created, but the welcome email could not be sent. " +
          "Check your Resend configuration (onboarding@resend.dev can only " +
          "deliver to your own Resend account email).",
      };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("[invite] Unexpected error:", err);
    return { error: "Failed to invite student" };
  }
}

export async function enrollStudentAction(input: {
  userId: string;
  courseId: string;
}) {
  const parsed = enrollStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.enrollment.create({
      data: {
        userId: parsed.data.userId,
        courseId: parsed.data.courseId,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "Student is already enrolled in this course" };
    }
    return { error: "Failed to enroll student" };
  }
}

export async function unenrollStudentAction(input: {
  userId: string;
  courseId: string;
}) {
  try {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: input.courseId,
        },
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { error: "Failed to unenroll student" };
  }
}

export async function getStudentsAction() {
  return prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
