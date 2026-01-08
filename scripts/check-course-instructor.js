const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseInstructor() {
  try {
    const courseId = '1fe8a20d-ef3f-46e9-9900-aea628cd180e';
    const instructorId = '25359b4b-0ec1-421b-8766-6df9ead5865f';

    console.log('🔍 ตรวจสอบ Course และ InstructorId\n');

    // Check course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        instructorId: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log('📚 ข้อมูลคอร์ส:');
    console.log(`   Title: ${course.title}`);
    console.log(`   Course ID: ${course.id}`);
    console.log(`   InstructorId in Course: ${course.instructorId}`);
    console.log('');

    if (course.instructor) {
      console.log('👤 ข้อมูลอาจารย์จาก relation:');
      console.log(`   Name: ${course.instructor.name}`);
      console.log(`   Email: ${course.instructor.email}`);
      console.log(`   ID: ${course.instructor.id}`);
      console.log(`   Role: ${course.instructor.role}`);
      console.log('');
    }

    // Check if IDs match
    const idsMatch = course.instructorId === instructorId;
    console.log('🔍 การเปรียบเทียบ:');
    console.log(`   Expected InstructorId: ${instructorId}`);
    console.log(`   Actual InstructorId:   ${course.instructorId}`);
    console.log(`   Match: ${idsMatch ? '✅ ตรงกัน' : '❌ ไม่ตรงกัน'}`);
    console.log('');

    if (!idsMatch) {
      console.log('⚠️  ปัญหา: instructorId ในตาราง Course ไม่ตรงกับ user ID');
      console.log('💡 แก้ไข: ต้องอัพเดท instructorId ในตาราง Course');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseInstructor();
