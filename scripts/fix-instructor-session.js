const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixInstructor() {
  try {
    const userId = '25359b4b-0ec1-421b-8766-6df9ead5865f';

    console.log('🔍 ตรวจสอบและแก้ไขข้อมูล Instructor\n');

    // 1. ตรวจสอบข้อมูล User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      console.log('❌ ไม่พบ user');
      return;
    }

    console.log('👤 ข้อมูล User:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.emailVerified || 'null'}`);
    console.log('');

    // 2. ตรวจสอบ role
    if (user.role !== 'INSTRUCTOR') {
      console.log(`⚠️  Role ปัจจุบัน: ${user.role}`);
      console.log('🔧 กำลังแก้ไข role เป็น INSTRUCTOR...');
      
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'INSTRUCTOR' }
      });
      
      console.log('✅ แก้ไข role สำเร็จ\n');
    } else {
      console.log('✅ Role ถูกต้อง: INSTRUCTOR\n');
    }

    // 3. ตรวจสอบ Sessions
    const sessions = await prisma.session.findMany({
      where: { userId: userId },
      orderBy: { expires: 'desc' },
      take: 5
    });

    console.log(`🔐 Sessions ที่ใช้งานได้ (${sessions.length} sessions):`);
    
    const now = new Date();
    let hasValidSession = false;

    sessions.forEach((session, index) => {
      const isExpired = session.expires < now;
      const status = isExpired ? '❌ หมดอายุ' : '✅ ใช้งานได้';
      
      if (!isExpired) hasValidSession = true;
      
      console.log(`   ${index + 1}. ${status}`);
      console.log(`      SessionToken: ${session.sessionToken.substring(0, 20)}...`);
      console.log(`      Expires: ${session.expires.toLocaleString('th-TH')}`);
    });
    console.log('');

    if (!hasValidSession) {
      console.log('⚠️  ไม่มี session ที่ใช้งานได้');
      console.log('💡 แนะนำ: ลอง Logout และ Login ใหม่อีกครั้ง\n');
    }

    // 4. ตรวจสอบ Courses
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        price: true
      }
    });

    console.log(`📚 Courses ของ Instructor (${courses.length} courses):`);
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
      console.log(`      ID: ${course.id}`);
      console.log(`      Status: ${course.status}`);
      console.log(`      Price: ${course.price} บาท`);
    });
    console.log('');

    // 5. ตรวจสอบยอดขาย
    if (courses.length > 0) {
      const courseIds = courses.map(c => c.id);
      
      const salesCount = await prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: { in: courseIds },
          order: {
            status: 'COMPLETED',
            payment: { status: 'COMPLETED' }
          }
        }
      });

      console.log(`💰 ยอดขายทั้งหมด: ${salesCount} รายการ\n`);
    }

    // 6. สรุปและคำแนะนำ
    console.log('=' .repeat(80));
    console.log('📋 สรุปการตรวจสอบ:\n');

    if (user.role === 'INSTRUCTOR') {
      console.log('✅ Role ถูกต้อง: INSTRUCTOR');
    } else {
      console.log('❌ Role ไม่ถูกต้อง');
    }

    if (hasValidSession) {
      console.log('✅ มี Session ที่ใช้งานได้');
    } else {
      console.log('❌ ไม่มี Session ที่ใช้งานได้');
    }

    if (courses.length > 0) {
      console.log(`✅ มี ${courses.length} คอร์ส`);
    } else {
      console.log('❌ ไม่มีคอร์ส');
    }

    console.log('');
    console.log('📝 ขั้นตอนแก้ปัญหา:');
    console.log('   1. Logout จากระบบ');
    console.log('   2. เคลียร์ Cache และ Cookies ของ Browser');
    console.log('   3. Login ด้วย email: ' + user.email);
    console.log('   4. ตรวจสอบว่า redirect ไปที่ /instructor/dashboard');
    console.log('   5. เปิด Browser Console (F12) ดู error');
    console.log('   6. ตรวจสอบว่า API calls มี Authorization header');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixInstructor();
