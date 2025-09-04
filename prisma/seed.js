const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  
  // ลบข้อมูลเก่า (ระวัง: จะลบข้อมูลทั้งหมด)
  console.log('🗑️ Cleaning existing data...');
  
  // สร้าง Users ทุก Role
  console.log('👥 Creating users...');
  
  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // ADMIN User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created:', admin.email);
  
  // INSTRUCTOR User
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Instructor User',
      password: hashedPassword,
      role: 'INSTRUCTOR'
    }
  });
  console.log('✅ Instructor user created:', instructor.email);
  
  // STUDENT User
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      password: hashedPassword,
      role: 'STUDENT'
    }
  });
  console.log('✅ Student user created:', student.email);
  
  // สร้าง Categories
  console.log('📂 Creating categories...');
  
  // เช็คว่ามี category แล้วหรือไม่
  let category1 = await prisma.category.findFirst({
    where: { name: 'การเขียนโปรแกรม' }
  });
  
  if (!category1) {
    category1 = await prisma.category.create({
      data: {
        name: 'การเขียนโปรแกรม',
        description: 'คอร์สเรียนเขียนโปรแกรมต่างๆ'
      }
    });
  }
  
  let category2 = await prisma.category.findFirst({
    where: { name: 'การออกแบบ' }
  });
  
  if (!category2) {
    category2 = await prisma.category.create({
      data: {
        name: 'การออกแบบ',
        description: 'คอร์สเรียนการออกแบบกราฟิก UI/UX'
      }
    });
  }
  
  console.log('✅ Categories created');
  
  // สร้าง Exam Categories
  console.log('📝 Creating exam categories...');
  
  let examCategory1 = await prisma.examCategory.findFirst({
    where: { name: 'คณิตศาสตร์' }
  });
  
  if (!examCategory1) {
    examCategory1 = await prisma.examCategory.create({
      data: {
        name: 'คณิตศาสตร์',
        description: 'ข้อสอบคณิตศาสตร์ทุกระดับ'
      }
    });
  }
  
  let examCategory2 = await prisma.examCategory.findFirst({
    where: { name: 'ภาษาอังกฤษ' }
  });
  
  if (!examCategory2) {
    examCategory2 = await prisma.examCategory.create({
      data: {
        name: 'ภาษาอังกฤษ',
        description: 'ข้อสอบภาษาอังกฤษ TOEIC, IELTS'
      }
    });
  }
  
  console.log('✅ Exam categories created');
  
  // สร้าง Ebook Categories
  console.log('📚 Creating ebook categories...');
  
  let ebookCategory1 = await prisma.ebookCategory.findFirst({
    where: { name: 'เทคโนโลยี' }
  });
  
  if (!ebookCategory1) {
    ebookCategory1 = await prisma.ebookCategory.create({
      data: {
        name: 'เทคโนโลยี',
        description: 'หนังสือเกี่ยวกับเทคโนโลยี'
      }
    });
  }
  
  let ebookCategory2 = await prisma.ebookCategory.findFirst({
    where: { name: 'ธุรกิจ' }
  });
  
  if (!ebookCategory2) {
    ebookCategory2 = await prisma.ebookCategory.create({
      data: {
        name: 'ธุรกิจ',
        description: 'หนังสือเกี่ยวกับการทำธุรกิจ'
      }
    });
  }
  
  console.log('✅ Ebook categories created');
  
  // สร้าง Post Types
  console.log('📰 Creating post types...');
  
  let postType1 = await prisma.postType.findFirst({
    where: { name: 'ข่าวสาร' }
  });
  
  if (!postType1) {
    postType1 = await prisma.postType.create({
      data: {
        name: 'ข่าวสาร',
        description: 'โพสต์ข่าวสารทั่วไป'
      }
    });
  }
  
  let postType2 = await prisma.postType.findFirst({
    where: { name: 'บทความ' }
  });
  
  if (!postType2) {
    postType2 = await prisma.postType.create({
      data: {
        name: 'บทความ',
        description: 'บทความด้านการศึกษา'
      }
    });
  }
  
  console.log('✅ Post types created');
  
  // สร้าง Sample Course
  console.log('🎓 Creating sample course...');
  
  const course = await prisma.course.create({
    data: {
      title: 'เรียน React.js สำหรับผู้เริ่มต้น',
      description: 'คอร์สเรียน React.js ตั้งแต่พื้นฐานจนถึงระดับกลาง',
      price: 1999,
      duration: 40,
      isFree: false,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      categoryId: category1.id
    }
  });
  
  console.log('✅ Sample course created:', course.title);
  
  // สร้าง Sample Ebook
  console.log('📖 Creating sample ebook...');
  
  const ebook = await prisma.ebook.create({
    data: {
      title: 'หนังสือเรียน JavaScript',
      description: 'หนังสือเรียน JavaScript สำหรับผู้เริ่มต้น',
      author: 'นักเขียน A',
      price: 299,
      language: 'th',
      format: 'PDF',
      isActive: true,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      fileSize: 1024000,
      categoryId: ebookCategory1.id
    }
  });
  
  console.log('✅ Sample ebook created:', ebook.title);
  
  // สร้าง Sample Exam Bank
  console.log('📝 Creating sample exam bank...');
  
  const examBank = await prisma.examBank.create({
    data: {
      title: 'ข้อสอบคณิตศาสตร์ ม.6',
      description: 'ข้อสอบคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6',
      categoryId: examCategory1.id,
      isActive: true
    }
  });
  
  console.log('✅ Sample exam bank created:', examBank.title);
  
  // สร้าง Sample Post
  console.log('📄 Creating sample post...');
  
  const post = await prisma.post.create({
    data: {
      title: 'ข่าวการเปิดคอร์สใหม่',
      content: 'เรามีคอร์สใหม่ๆ มากมายให้เลือกเรียน',
      excerpt: 'ข่าวการเปิดคอร์สใหม่สำหรับเดือนนี้',
      slug: 'news-new-courses',
      isActive: true,
      isFeatured: true,
      publishedAt: new Date(),
      authorId: admin.id,
      postTypeId: postType1.id
    }
  });
  
  console.log('✅ Sample post created:', post.title);
  
  console.log('🌱 Seeding finished!');
  console.log('\n📋 Created accounts:');
  console.log('👤 Admin: admin@example.com / 123456');
  console.log('👨‍🏫 Instructor: instructor@example.com / 123456');
  console.log('👨‍🎓 Student: student@example.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
