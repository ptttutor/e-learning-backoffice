import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create example instructors
  const instructor1 = await prisma.user.upsert({
    where: { email: 'instructor1@example.com' },
    update: {},
    create: {
      email: 'instructor1@example.com',
      name: 'Instructor One',
      role: 'INSTRUCTOR',
    },
  });
  const instructor2 = await prisma.user.upsert({
    where: { email: 'instructor2@example.com' },
    update: {},
    create: {
      email: 'instructor2@example.com',
      name: 'Instructor Two',
      role: 'INSTRUCTOR',
    },
  });
  // สร้าง Users
  await prisma.user.createMany({
    data: [
      { id: 'u1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
      { id: 'u2', email: 'instructor@example.com', name: 'Instructor', role: 'INSTRUCTOR' },
      { id: 'u3', email: 'student@example.com', name: 'Student', role: 'STUDENT' },
    ],
    skipDuplicates: true,
  });

  // สร้าง Category
  await prisma.category.createMany({
    data: [
      { id: 'c1', name: 'Programming', description: 'Learn to code' },
      { id: 'c2', name: 'Design', description: 'Design skills' },
    ],
    skipDuplicates: true,
  });

  // สร้าง Course
  await prisma.course.createMany({
    data: [
      { id: 'course1', title: 'Next.js for Beginners', description: 'Learn Next.js', price: 1000, instructorId: 'u2', categoryId: 'c1', status: 'PUBLISHED' },
      { id: 'course2', title: 'UI/UX Design', description: 'Design beautiful apps', price: 800, instructorId: 'u2', categoryId: 'c2', status: 'PUBLISHED' },
    ],
    skipDuplicates: true,
  });

  // สร้าง Chapter
  await prisma.chapter.createMany({
    data: [
      { id: 'ch1', title: 'Intro to Next.js', order: 1, courseId: 'course1' },
      { id: 'ch2', title: 'Next.js Routing', order: 2, courseId: 'course1' },
      { id: 'ch3', title: 'Intro to Design', order: 1, courseId: 'course2' },
    ],
    skipDuplicates: true,
  });

  // สร้าง Content
  await prisma.content.createMany({
    data: [
      { id: 'ct1', title: 'What is Next.js?', contentType: 'VIDEO', contentUrl: 'https://youtube.com/nextjs', order: 1, chapterId: 'ch1' },
      { id: 'ct2', title: 'Pages & Routing', contentType: 'PDF', contentUrl: 'https://example.com/routing.pdf', order: 2, chapterId: 'ch2' },
      { id: 'ct3', title: 'Design Basics', contentType: 'VIDEO', contentUrl: 'https://youtube.com/design', order: 1, chapterId: 'ch3' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded users, categories, courses, chapters, contents successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
