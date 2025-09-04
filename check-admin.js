const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('Admin users found:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log('- Email:', user.email, 'Name:', user.name);
    });
    
    if (adminUsers.length === 0) {
      console.log('No admin users found. Run: node scripts/create-admin.js');
    }
  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
