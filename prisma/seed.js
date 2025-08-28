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



  // สร้าง EbookCategory
  await prisma.ebookCategory.createMany({
    data: [
      { id: 'ec1', name: 'การเขียนโปรแกรม', description: 'หนังสือเกี่ยวกับการเขียนโปรแกรม', isActive: true },
      { id: 'ec2', name: 'การออกแบบ', description: 'หนังสือเกี่ยวกับการออกแบบ', isActive: true },
      { id: 'ec3', name: 'ธุรกิจ', description: 'หนังสือเกี่ยวกับธุรกิจ', isActive: true },
      { id: 'ec4', name: 'การพัฒนาตนเอง', description: 'หนังสือเกี่ยวกับการพัฒนาตนเอง', isActive: true },
    ],
    skipDuplicates: true,
  });

  // สร้าง Ebook
  await prisma.ebook.createMany({
    data: [
      {
        id: 'eb1',
        title: 'เรียนรู้ JavaScript ฉบับสมบูรณ์',
        description: 'หนังสือสำหรับเรียนรู้ JavaScript ตั้งแต่พื้นฐานจนถึงขั้นสูง',
        author: 'นาย ดีเวลอปเปอร์',
        isbn: '978-616-123-456-7',
        price: 590,
        discountPrice: 490,
        coverImageUrl: '/images/ebooks/javascript-book.jpg',
        previewUrl: '/files/ebooks/javascript-preview.pdf',
        fileUrl: '/files/ebooks/javascript-full.pdf',
        fileSize: 15728640, // 15MB
        pageCount: 350,
        language: 'th',
        format: 'PDF',
        isPhysical: true,
        weight: 0.8,
        dimensions: '21x29.7x2 cm',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        categoryId: 'ec1',
      },
      {
        id: 'eb2',
        title: 'React Hooks ในทางปฏิบัติ',
        description: 'เรียนรู้การใช้ React Hooks อย่างมีประสิทธิภาพ',
        author: 'นางสาว รีแอคเตอร์',
        isbn: '978-616-123-457-8',
        price: 450,
        coverImageUrl: '/images/ebooks/react-hooks.jpg',
        fileUrl: '/files/ebooks/react-hooks.epub',
        fileSize: 8388608, // 8MB
        pageCount: 280,
        language: 'th',
        format: 'EPUB',
        isPhysical: false,
        isActive: true,
        isFeatured: false,
        publishedAt: new Date(),
        categoryId: 'ec1',
      },
      {
        id: 'eb3',
        title: 'UI/UX Design Principles',
        description: 'หลักการออกแบบ UI/UX ที่ดี',
        author: 'คุณ ดีไซเนอร์',
        isbn: '978-616-123-458-9',
        price: 390,
        discountPrice: 320,
        coverImageUrl: '/images/ebooks/ui-ux-design.jpg',
        previewUrl: '/files/ebooks/ui-ux-preview.pdf',
        fileUrl: '/files/ebooks/ui-ux-full.pdf',
        fileSize: 12582912, // 12MB
        pageCount: 220,
        language: 'th',
        format: 'PDF',
        isPhysical: true,
        weight: 0.6,
        dimensions: '21x29.7x1.5 cm',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        categoryId: 'ec2',
      },
    ],
    skipDuplicates: true,
  });



  // สร้าง EbookReview
  await prisma.ebookReview.createMany({
    data: [
      {
        ebookId: 'eb1',
        userId: 'u3',
        rating: 5,
        comment: 'หนังสือดีมาก เข้าใจง่าย อธิบายชัดเจน',
        isActive: true,
      },
      {
        ebookId: 'eb2',
        userId: 'u3',
        rating: 4,
        comment: 'เนื้อหาดี แต่อยากให้มีตัวอย่างเพิ่มเติม',
        isActive: true,
      },
      {
        ebookId: 'eb3',
        userId: 'u3',
        rating: 5,
        comment: 'หนังสือออกแบบที่ดีที่สุดเล่มหนึ่ง',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded users, categories, courses, chapters, contents, posts, ebooks successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
