// Test script สำหรับเรียก Instructor Dashboard API
// จำลองการเรียก API โดยตรงเพื่อดูว่า response เป็นอย่างไร

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateInstructorStatsAPI() {
  try {
    const instructorId = '25359b4b-0ec1-421b-8766-6df9ead5865f';
    const period = '30'; // days

    console.log('🔧 จำลองการเรียก GET /api/instructor/dashboard/stats?period=30\n');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // หา courses ของ instructor
    const instructorCourses = await prisma.course.findMany({
      where: {
        instructorId: instructorId
      },
      select: {
        id: true
      }
    });

    const courseIds = instructorCourses.map(course => course.id);

    if (courseIds.length === 0) {
      console.log('❌ API จะ return ข้อมูล 0 ทั้งหมด');
      return;
    }

    console.log(`✅ พบ ${courseIds.length} คอร์ส`);
    console.log(`📅 ช่วงเวลา: ${startDate.toISOString()} ถึง ${endDate.toISOString()}\n`);

    // สถิติ Orders
    const [totalOrders, completedOrders, pendingOrders] = await Promise.all([
      prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: { in: courseIds },
          order: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }),
      prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: { in: courseIds },
          order: {
            status: 'COMPLETED',
            payment: { status: 'COMPLETED' },
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }),
      prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: { in: courseIds },
          order: {
            status: 'PENDING',
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      })
    ]);

    // คำนวณรายได้
    const orderItemsRevenue = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: { in: courseIds },
        order: {
          status: 'COMPLETED',
          payment: { status: 'COMPLETED' },
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      select: {
        totalPrice: true,
        order: {
          select: {
            total: true
          }
        }
      }
    });

    const totalRevenue = orderItemsRevenue.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // จำนวน courses
    const totalCourses = courseIds.length;

    // จำนวนผู้เรียนที่ซื้อคอร์ส (unique users)
    const uniqueUsers = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: { in: courseIds },
        order: {
          status: 'COMPLETED',
          payment: { status: 'COMPLETED' }
        }
      },
      select: {
        order: {
          select: {
            userId: true
          }
        }
      },
      distinct: ['orderId']
    });

    const uniqueUserIds = [...new Set(uniqueUsers.map(item => item.order.userId))];
    const totalUsers = uniqueUserIds.length;

    // ผู้เรียนใหม่ในช่วงเวลาที่เลือก
    const newUsers = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: { in: courseIds },
        order: {
          status: 'COMPLETED',
          payment: { status: 'COMPLETED' },
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      select: {
        order: {
          select: {
            userId: true
          }
        }
      },
      distinct: ['orderId']
    });

    const newUserIds = [...new Set(newUsers.map(item => item.order.userId))];
    const newUsersThisPeriod = newUserIds.length;

    const apiResponse = {
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue: totalRevenue,
        courseRevenue: totalRevenue,
        ebookRevenue: 0,
        averageOrderValue,
        totalCourses,
        totalEbooks: 0,
        totalUsers,
        newUsersThisPeriod
      }
    };

    console.log('📤 API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    console.log('📊 สรุป:');
    console.log(`   - Total Orders (30 days): ${totalOrders}`);
    console.log(`   - Completed Orders: ${completedOrders}`);
    console.log(`   - Pending Orders: ${pendingOrders}`);
    console.log(`   - Total Revenue: ${totalRevenue.toLocaleString()} บาท`);
    console.log(`   - Average Order Value: ${averageOrderValue.toLocaleString()} บาท`);
    console.log(`   - Total Courses: ${totalCourses}`);
    console.log(`   - Total Users: ${totalUsers}`);
    console.log(`   - New Users (30 days): ${newUsersThisPeriod}`);

    if (totalOrders > 0 && completedOrders > 0 && totalRevenue > 0) {
      console.log('\n✅ API ควรแสดงข้อมูลได้ปกติ!');
      console.log('\n💡 ถ้า Dashboard ยังแสดง 0 อยู่:');
      console.log('   1. ตรวจสอบ Console ของ Browser (F12) ดู error');
      console.log('   2. ตรวจสอบว่า session มี role = INSTRUCTOR');
      console.log('   3. ตรวจสอบว่า API endpoint ถูกเรียกจริงหรือไม่');
      console.log('   4. ลอง refresh หน้า dashboard');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateInstructorStatsAPI();
