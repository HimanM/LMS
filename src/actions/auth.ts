"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user to check role for proper redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role as string | undefined;
  const requiresPasswordChange =
    user?.user_metadata?.requiresPasswordChange ?? false;

  if (requiresPasswordChange) {
    redirect("/set-password");
  }

  redirect(role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();

  // Update the user's password
  const { error: updateError } = await supabase.auth.updateUser({
    password,
    data: { requiresPasswordChange: false },
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Also update Prisma record
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { email: user.email! },
      data: { requiresPasswordChange: false },
    });
  }

  const role = user?.user_metadata?.role as string | undefined;
  redirect(role === "ADMIN" ? "/admin" : "/dashboard");
}
