import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// ─────────────────────────────────────────────────────────────
// Configuration — Edit these before running
// ─────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Test@1234!"; // Default password for all seeded users

const ADMIN_USERS = [
  { email: "admin@lms.local", role: Role.ADMIN },
  { email: "testadmin@lms.local", role: Role.ADMIN },
];

const TEST_STUDENTS = [
  { email: "student1@lms.local", role: Role.STUDENT },
  { email: "student2@lms.local", role: Role.STUDENT },
  { email: "student3@lms.local", role: Role.STUDENT },
];

// Sample courses with YouTube videos for testing
const SAMPLE_COURSES = [
  {
    title: "Introduction to Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript from scratch.",
    isActive: true,
    videos: [
      {
        title: "What is Web Development?",
        youtubeUrl: "https://www.youtube.com/watch?v=ysEN5RaKOlA",
        sequence: 1,
      },
      {
        title: "HTML Basics",
        youtubeUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        sequence: 2,
      },
      {
        title: "CSS Fundamentals",
        youtubeUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI",
        sequence: 3,
      },
    ],
  },
  {
    title: "React for Beginners",
    description:
      "A beginner-friendly course on building modern UIs with React.",
    isActive: true,
    videos: [
      {
        title: "What is React?",
        youtubeUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
        sequence: 1,
      },
      {
        title: "Components & Props",
        youtubeUrl: "https://www.youtube.com/watch?v=Cla1WwguArA",
        sequence: 2,
      },
    ],
  },
  {
    title: "Advanced TypeScript",
    description: "Deep dive into TypeScript generics, utility types, and more.",
    isActive: false, // inactive course for testing filters
    videos: [
      {
        title: "Generics in Depth",
        youtubeUrl: "https://www.youtube.com/watch?v=nViEqpgwxHE",
        sequence: 1,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Seed Script
// ─────────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface SeedUser {
  email: string;
  role: Role;
}

async function createAuthUser(user: SeedUser): Promise<string | null> {
  // Check if user already exists in Supabase Auth
  const { data: existingUsers } =
    await supabaseAdmin.auth.admin.listUsers();

  const existing = existingUsers?.users?.find(
    (u) => u.email === user.email
  );

  if (existing) {
    console.log(`  ⏭  Auth user already exists: ${user.email}`);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: SEED_PASSWORD,
    email_confirm: true, // Auto-confirm so they can log in immediately
    user_metadata: {
      role: user.role,
    },
  });

  if (error) {
    console.error(`  ✖  Failed to create auth user ${user.email}:`, error.message);
    return null;
  }

  console.log(`  ✔  Auth user created: ${user.email} (${data.user.id})`);
  return data.user.id;
}

async function createPrismaUser(
  id: string,
  user: SeedUser,
  requiresPasswordChange: boolean
) {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (existing) {
    console.log(`  ⏭  Prisma user already exists: ${user.email}`);
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      id,
      email: user.email,
      role: user.role,
      requiresPasswordChange,
    },
  });

  console.log(`  ✔  Prisma user created: ${user.email} [${user.role}]`);
  return created;
}

async function seedUsers() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seeding Admin Users");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const adminIds: string[] = [];

  for (const admin of ADMIN_USERS) {
    const authId = await createAuthUser(admin);
    if (authId) {
      await createPrismaUser(authId, admin, false); // Admins don't need password change
      adminIds.push(authId);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seeding Test Students");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const studentIds: string[] = [];

  for (const student of TEST_STUDENTS) {
    const authId = await createAuthUser(student);
    if (authId) {
      await createPrismaUser(authId, student, false); // Test users start with password already set
      studentIds.push(authId);
    }
  }

  return { adminIds, studentIds };
}

async function seedCourses() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seeding Courses & Videos");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const courseIds: string[] = [];

  for (const courseData of SAMPLE_COURSES) {
    const existing = await prisma.course.findFirst({
      where: { title: courseData.title },
    });

    if (existing) {
      console.log(`  ⏭  Course already exists: ${courseData.title}`);
      courseIds.push(existing.id);
      continue;
    }

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        isActive: courseData.isActive,
        videos: {
          create: courseData.videos,
        },
      },
    });

    console.log(
      `  ✔  Course created: ${course.title} (${courseData.videos.length} videos)`
    );
    courseIds.push(course.id);
  }

  return courseIds;
}

async function seedEnrollments(studentIds: string[], courseIds: string[]) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seeding Enrollments");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Enroll all students in the first active course
  const activeCourseIds = courseIds.slice(0, 2); // First 2 courses are active

  for (const studentId of studentIds) {
    for (const courseId of activeCourseIds) {
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: studentId, courseId },
        },
      });

      if (existing) {
        console.log(`  ⏭  Enrollment already exists: ${studentId} → ${courseId}`);
        continue;
      }

      await prisma.enrollment.create({
        data: { userId: studentId, courseId },
      });

      console.log(`  ✔  Enrolled student ${studentId.slice(0, 8)}… → course ${courseId.slice(0, 8)}…`);
    }
  }
}

async function seedProgress(studentIds: string[], courseIds: string[]) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seeding Sample Progress");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Give the first student some progress on the first course
  if (studentIds.length === 0 || courseIds.length === 0) {
    console.log("  ⏭  No students or courses to add progress for");
    return;
  }

  const firstStudentId = studentIds[0];
  const firstCourseId = courseIds[0];

  const videos = await prisma.video.findMany({
    where: { courseId: firstCourseId },
    orderBy: { sequence: "asc" },
  });

  if (videos.length === 0) {
    console.log("  ⏭  No videos found in first course");
    return;
  }

  // Mark the first video as completed for student1
  const firstVideo = videos[0];
  const existing = await prisma.userProgress.findUnique({
    where: {
      userId_videoId: { userId: firstStudentId, videoId: firstVideo.id },
    },
  });

  if (existing) {
    console.log(`  ⏭  Progress already exists for student1 → ${firstVideo.title}`);
    return;
  }

  await prisma.userProgress.create({
    data: {
      userId: firstStudentId,
      videoId: firstVideo.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  console.log(
    `  ✔  student1 completed: "${firstVideo.title}" (video 1 of ${videos.length})`
  );
}

async function main() {
  console.log("╔═══════════════════════════════════════╗");
  console.log("║        LMS Database Seeder            ║");
  console.log("╚═══════════════════════════════════════╝");

  // Validate env vars
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n✖ Missing environment variables: ${missing.join(", ")}`);
    console.error("  Make sure your .env file is configured.\n");
    process.exit(1);
  }

  try {
    const { studentIds } = await seedUsers();
    const courseIds = await seedCourses();
    await seedEnrollments(studentIds, courseIds);
    await seedProgress(studentIds, courseIds);

    console.log("\n╔═══════════════════════════════════════╗");
    console.log("║        Seed Complete ✔                ║");
    console.log("╠═══════════════════════════════════════╣");
    console.log("║                                       ║");
    console.log("║  All credentials use password:         ║");
    console.log(`║  ${SEED_PASSWORD.padEnd(37)}║`);
    console.log("║                                       ║");
    console.log("║  Admin accounts:                       ║");
    for (const a of ADMIN_USERS) {
      console.log(`║    ${a.email.padEnd(33)}║`);
    }
    console.log("║                                       ║");
    console.log("║  Student accounts:                     ║");
    for (const s of TEST_STUDENTS) {
      console.log(`║    ${s.email.padEnd(33)}║`);
    }
    console.log("║                                       ║");
    console.log("║  Courses: 3 (2 active, 1 inactive)    ║");
    console.log("║  Enrollments: students → 2 courses     ║");
    console.log("║  Progress: student1 → 1 video done     ║");
    console.log("║                                       ║");
    console.log("╚═══════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n✖ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
