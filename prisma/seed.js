const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // สร้างรหัสผ่าน hash สำหรับ admin
  const hashedPassword = await bcrypt.hash('123456', 10);

  // สร้าง user admin
  await prisma.user.upsert({
    where: { email: 'admin@ptttutor.com' },
    update: {},
    create: {
      email: 'admin@ptttutor.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // เพิ่ม seed อื่นๆ ได้ที่นี่ เช่น Course, Category, ฯลฯ
  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
