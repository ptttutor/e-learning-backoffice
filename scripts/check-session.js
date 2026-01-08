const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSession() {
  try {
    const userId = '25359b4b-0ec1-421b-8766-6df9ead5865f';
    
    console.log('🔍 กำลังตรวจสอบ Session และ Account...\n');
    
    // เช็ค User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        sessions: true
      }
    });
    
    if (!user) {
      console.log('❌ ไม่พบ user นี้');
      return;
    }
    
    console.log('👤 ข้อมูล User:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);
    
    console.log('🔑 Accounts:');
    if (user.accounts.length === 0) {
      console.log('   ❌ ไม่มี Account (ต้องมีเพื่อ login ด้วย Credentials)');
    } else {
      user.accounts.forEach((acc, idx) => {
        console.log(`   ${idx + 1}. Provider: ${acc.provider}, Type: ${acc.type}`);
      });
    }
    console.log();
    
    console.log('📱 Active Sessions:');
    if (user.sessions.length === 0) {
      console.log('   ⚠️  ไม่มี Session ที่ active (ต้อง login ใหม่)');
    } else {
      const now = new Date();
      user.sessions.forEach((session, idx) => {
        const expired = session.expires < now;
        console.log(`   ${idx + 1}. Token: ${session.sessionToken.substring(0, 20)}...`);
        console.log(`      Expires: ${session.expires.toLocaleString('th-TH')}`);
        console.log(`      Status: ${expired ? '❌ หมดอายุแล้ว' : '✅ ยังใช้งานได้'}`);
      });
    }
    console.log();
    
    // คำแนะนำ
    console.log('💡 วิธีแก้ไข:');
    console.log('   1. เปิด browser ที่ http://localhost:3001');
    console.log('   2. กด Logout (ถ้ามี)');
    console.log('   3. Login ใหม่ด้วย:');
    console.log(`      Email: ${user.email}`);
    console.log('      Password: (รหัสผ่านของคุณ)');
    console.log('   4. NextAuth จะสร้าง session ใหม่ให้อัตโนมัติ');
    console.log('   5. Dashboard จะแสดงข้อมูลได้ทันที\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSession();
