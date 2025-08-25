const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้น seeding...')

  // สร้าง Categories
  const physicsCategory = await prisma.category.upsert({
    where: { slug: 'physics' },
    update: {},
    create: {
      name: 'ฟิสิกส์',
      slug: 'physics',
      description: 'วิชาฟิสิกส์ทุกระดับ',
      isActive: true
    }
  })

  const mathCategory = await prisma.category.upsert({
    where: { slug: 'mathematics' },
    update: {},
    create: {
      name: 'คณิตศาสตร์',
      slug: 'mathematics',
      description: 'วิชาคณิตศาสตร์ทุกระดับ',
      isActive: true
    }
  })

  // สร้าง Subjects
  const physicsSubject = await prisma.subject.upsert({
    where: { slug: 'physics-high-school' },
    update: {},
    create: {
      name: 'ฟิสิกส์ ม.ปลาย',
      slug: 'physics-high-school',
      description: 'ฟิสิกส์สำหรับนักเรียนมัธยมศึกษาตอนปลาย',
      categoryId: physicsCategory.id,
      color: '#3B82F6',
      icon: 'physics',
      isActive: true
    }
  })

  const mathSubject = await prisma.subject.upsert({
    where: { slug: 'math-high-school' },
    update: {},
    create: {
      name: 'คณิตศาสตร์ ม.ปลาย',
      slug: 'math-high-school',
      description: 'คณิตศาสตร์สำหรับนักเรียนมัธยมศึกษาตอนปลาย',
      categoryId: mathCategory.id,
      color: '#10B981',
      icon: 'calculator',
      isActive: true
    }
  })

  // สร้าง Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@physics.com' },
    update: {},
    create: {
      email: 'admin@physics.com',
      passwordHash: adminPassword,
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      role: 'admin',
      isActive: true,
      emailVerified: true
    }
  })

  // สร้าง Teacher User
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@physics.com' },
    update: {},
    create: {
      email: 'teacher@physics.com',
      passwordHash: teacherPassword,
      firstName: 'พี่เต้ย',
      lastName: 'ฟิสิกส์',
      role: 'teacher',
      isActive: true,
      emailVerified: true
    }
  })

  // สร้าง Student User
  const studentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@physics.com' },
    update: {},
    create: {
      email: 'student@physics.com',
      passwordHash: studentPassword,
      firstName: 'นักเรียน',
      lastName: 'ทดสอบ',
      role: 'student',
      isActive: true,
      emailVerified: true
    }
  })

  // สร้าง Courses
  const physicsCourse = await prisma.course.upsert({
    where: { slug: 'physics-mechanics-basics' },
    update: {},
    create: {
      title: 'ฟิสิกส์ กลศาสตร์พื้นฐาน',
      slug: 'physics-mechanics-basics',
      description: 'เรียนรู้หลักการพื้นฐานของกลศาสตร์ ตั้งแต่การเคลื่อนที่ แรง และพลังงาน',
      shortDescription: 'กลศาสตร์พื้นฐานสำหรับนักเรียน ม.ปลาย',
      subjectId: physicsSubject.id,
      teacherId: teacher.id,
      level: 'beginner',
      price: 1500,
      originalPrice: 2000,
      durationHours: 20,
      requirements: 'ความรู้คณิตศาสตร์พื้นฐาน',
      whatYouLearn: 'เข้าใจหลักการเคลื่อนที่, แรงและการเคลื่อนที่, พลังงานและโมเมนตัม',
      isPublished: true,
      isFeatured: true
    }
  })

  const mathCourse = await prisma.course.upsert({
    where: { slug: 'calculus-basics' },
    update: {},
    create: {
      title: 'แคลคูลัสพื้นฐาน',
      slug: 'calculus-basics',
      description: 'เรียนรู้แคลคูลัสตั้งแต่พื้นฐาน ลิมิต อนุพันธ์ และปริพันธ์',
      shortDescription: 'แคลคูลัสสำหรับมือใหม่',
      subjectId: mathSubject.id,
      teacherId: teacher.id,
      level: 'intermediate',
      price: 2000,
      originalPrice: 2500,
      durationHours: 30,
      requirements: 'คณิตศาสตร์ ม.6',
      whatYouLearn: 'ลิมิต, อนุพันธ์, ปริพันธ์, การประยุกต์ใช้',
      isPublished: true,
      isFeatured: false
    }
  })

  // สร้าง Course Chapters และ Lessons
  const chapter1 = await prisma.courseChapter.create({
    data: {
      courseId: physicsCourse.id,
      title: 'บทที่ 1: การเคลื่อนที่',
      description: 'เรียนรู้เกี่ยวกับการเคลื่อนที่ในมิติเดียวและสองมิติ',
      sortOrder: 1,
      isPublished: true
    }
  })

  await prisma.courseLesson.createMany({
    data: [
      {
        chapterId: chapter1.id,
        title: 'การเคลื่อนที่ในแนวเส้นตรง',
        contentType: 'video',
        description: 'เรียนรู้การเคลื่อนที่ในแนวเส้นตรง',
        durationMinutes: 45,
        sortOrder: 1,
        isPublished: true,
        isFree: true
      },
      {
        chapterId: chapter1.id,
        title: 'ความเร็วและความเร่ง',
        contentType: 'video',
        description: 'ทำความเข้าใจความเร็วและความเร่ง',
        durationMinutes: 50,
        sortOrder: 2,
        isPublished: true,
        isFree: false
      }
    ]
  })

  // สร้าง Exam Types
  await prisma.examType.upsert({
    where: { slug: 'gat-pat' },
    update: {},
    create: {
      name: 'GAT-PAT',
      slug: 'gat-pat',
      description: 'ข้อสอบ GAT-PAT',
      isActive: true
    }
  })

  await prisma.examType.upsert({
    where: { slug: 'a-level' },
    update: {},
    create: {
      name: 'A-Level',
      slug: 'a-level',
      description: 'ข้อสอบ A-Level',
      isActive: true
    }
  })

  // สร้าง Settings
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: {
      key: 'site_name',
      value: 'ฟิสิกส์พี่เต้ย Learning System',
      type: 'string',
      description: 'ชื่อเว็บไซต์',
      isPublic: true
    }
  })

  await prisma.setting.upsert({
    where: { key: 'site_description' },
    update: {},
    create: {
      key: 'site_description',
      value: 'ระบบเรียนออนไลน์ฟิสิกส์และคณิตศาสตร์',
      type: 'string',
      description: 'คำอธิบายเว็บไซต์',
      isPublic: true
    }
  })

  console.log('✅ Seeding เสร็จสิ้น!')
  console.log('👤 Admin: admin@physics.com / admin123')
  console.log('👨‍🏫 Teacher: teacher@physics.com / teacher123')
  console.log('👨‍🎓 Student: student@physics.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })