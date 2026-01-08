const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function fixInstructorAuth() {
  try {
    const userId = '25359b4b-0ec1-421b-8766-6df9ead5865f';
    const email = 'tawan@tutor.com';
    const password = '123456'; // รหัสผ่านเริ่มต้น
    
    console.log('🔧 กำลังแก้ไข Authentication สำหรับ instructor...\n');
    
    // 1. เช็คว่า user มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('❌ ไม่พบ user นี้');
      return;
    }
    
    console.log(`✅ พบ user: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}\n`);
    
    // 2. ลบ Account เก่าถ้ามี
    await prisma.account.deleteMany({
      where: { userId }
    });
    console.log('🗑️  ลบ Account เก่า (ถ้ามี)');
    
    // 3. ลบ Session เก่าถ้ามี
    await prisma.session.deleteMany({
      where: { userId }
    });
    console.log('🗑️  ลบ Session เก่า (ถ้ามี)\n');
    
    // 4. สร้าง Account ใหม่แบบ Credentials
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const account = await prisma.account.create({
      data: {
        userId,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: email,
        password: hashedPassword
      }
    });
    console.log('✅ สร้าง Credentials Account แล้ว');
    console.log(`   Provider: ${account.provider}`);
    console.log(`   Type: ${account.type}\n`);
    
    // 5. สร้าง Session ใหม่
    const sessionToken = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // หมดอายุใน 30 วัน
    
    const session = await prisma.session.create({
      data: {
        userId,
        sessionToken,
        expires
      }
    });
    console.log('✅ สร้าง Session แล้ว');
    console.log(`   Token: ${sessionToken.substring(0, 20)}...`);
    console.log(`   Expires: ${expires.toLocaleString('th-TH')}\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ แก้ไขเสร็จสมบูรณ์!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📝 ข้อมูลสำหรับ Login:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}\n`);
    
    console.log('🔄 ขั้นตอนต่อไป:');
    console.log('   1. เปิด browser ไปที่ http://localhost:3001/login');
    console.log('   2. Login ด้วยข้อมูลข้างบน');
    console.log('   3. จะถูก redirect ไปที่ /instructor/dashboard');
    console.log('   4. Dashboard จะโชว์ข้อมูลได้ทันที!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.log('\n💡 มี Account อยู่แล้ว - ลองเรียกใช้ script อีกครั้ง');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixInstructorAuth();
