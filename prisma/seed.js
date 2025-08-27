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

  // สร้าง PostType
  await prisma.postType.createMany({
    data: [
      { id: 'pt1', name: 'บทความ', description: 'บทความทั่วไป', isActive: true },
      { id: 'pt2', name: 'ข่าวสาร', description: 'ข่าวสารและประกาศ', isActive: true },
      { id: 'pt3', name: 'บทเรียน', description: 'เนื้อหาการเรียนการสอน', isActive: true },
      { id: 'pt4', name: 'เคล็ดลับ', description: 'เคล็ดลับและแนวทางปฏิบัติ', isActive: true },
    ],
    skipDuplicates: true,
  });

  // สร้าง Tag
  await prisma.tag.createMany({
    data: [
      { id: 't1', name: 'JavaScript', slug: 'javascript', color: '#f7df1e', isActive: true },
      { id: 't2', name: 'React', slug: 'react', color: '#61dafb', isActive: true },
      { id: 't3', name: 'Next.js', slug: 'nextjs', color: '#000000', isActive: true },
      { id: 't4', name: 'CSS', slug: 'css', color: '#1572b6', isActive: true },
      { id: 't5', name: 'Design', slug: 'design', color: '#ff6b6b', isActive: true },
      { id: 't6', name: 'Tutorial', slug: 'tutorial', color: '#4ecdc4', isActive: true },
    ],
    skipDuplicates: true,
  });

  // สร้าง Post
  await prisma.post.createMany({
    data: [
      {
        id: 'p1',
        title: 'เริ่มต้นเรียน Next.js สำหรับมือใหม่',
        content: 'Next.js เป็น React framework ที่ช่วยให้การพัฒนาเว็บแอปพลิเคชันง่ายขึ้น...',
        excerpt: 'เรียนรู้พื้นฐาน Next.js สำหรับผู้เริ่มต้น',
        imageUrl: '/images/nextjs-tutorial.jpg',
        imageUrlMobileMode: '/images/nextjs-tutorial-mobile.jpg',
        slug: 'nextjs-for-beginners',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        authorId: 'u2',
        postTypeId: 'pt3',
      },
      {
        id: 'p2',
        title: 'เทคนิคการออกแบบ UI ที่ดี',
        content: 'การออกแบบ UI ที่ดีต้องคำนึงถึงหลายปัจจัย เช่น ความสวยงาม ความใช้งานง่าย...',
        excerpt: 'เรียนรู้หลักการออกแบบ UI ที่มีประสิทธิภาพ',
        imageUrl: '/images/ui-design-tips.jpg',
        imageUrlMobileMode: '/images/ui-design-tips-mobile.jpg',
        slug: 'good-ui-design-techniques',
        isActive: true,
        isFeatured: false,
        publishedAt: new Date(),
        authorId: 'u2',
        postTypeId: 'pt4',
      },
      {
        id: 'p3',
        title: 'ประกาศเปิดคอร์สใหม่ประจำเดือน',
        content: 'เรามีความยินดีที่จะประกาศเปิดคอร์สใหม่ในเดือนนี้...',
        excerpt: 'ประกาศเปิดคอร์สใหม่สำหรับเดือนนี้',
        imageUrl: '/images/new-courses.jpg',
        imageUrlMobileMode: '/images/new-courses-mobile.jpg',
        slug: 'new-courses-announcement',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        authorId: 'u1',
        postTypeId: 'pt2',
      },
    ],
    skipDuplicates: true,
  });

  // สร้าง PostTag relationships
  await prisma.postTag.createMany({
    data: [
      { postId: 'p1', tagId: 't3' }, // Next.js
      { postId: 'p1', tagId: 't2' }, // React
      { postId: 'p1', tagId: 't6' }, // Tutorial
      { postId: 'p2', tagId: 't5' }, // Design
      { postId: 'p2', tagId: 't4' }, // CSS
      { postId: 'p2', tagId: 't6' }, // Tutorial
    ],
    skipDuplicates: true,
  });

  console.log('Seeded users, categories, courses, chapters, contents, posts successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
