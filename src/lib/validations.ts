import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Courses ───────────────────────────────────────────
export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

// ─── Videos ────────────────────────────────────────────
export const videoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  youtubeUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return (
            parsed.hostname === "www.youtube.com" ||
            parsed.hostname === "youtube.com" ||
            parsed.hostname === "youtu.be"
          );
        } catch {
          return false;
        }
      },
      { message: "Must be a valid YouTube URL" }
    ),
  sequence: z.coerce.number().int().positive("Sequence must be a positive integer"),
  courseId: z.string().cuid("Invalid course ID"),
});

// ─── Students / Enrollment ─────────────────────────────
export const inviteStudentSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const enrollStudentSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  courseId: z.string().cuid("Invalid course ID"),
});

// ─── Progress ──────────────────────────────────────────
export const markCompleteSchema = z.object({
  videoId: z.string().cuid("Invalid video ID"),
  courseId: z.string().cuid("Invalid course ID"),
});

// ─── Types ──────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type InviteStudentInput = z.infer<typeof inviteStudentSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
export type MarkCompleteInput = z.infer<typeof markCompleteSchema>;
