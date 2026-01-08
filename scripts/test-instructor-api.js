const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInstructorAPI() {
  try {
    const instructorId = '25359b4b-0ec1-421b-8766-6df9ead5865f';

    console.log('🧪 ทดสอบ Logic ของ Instructor Dashboard API\n');

    // Simulate API logic - Get instructor courses
    const instructorCourses = await prisma.course.findMany({
      where: {
        instructorId: instructorId
      },
      select: {
        id: true,
        title: true,
        price: true
      }
    });

    console.log(`📚 จำนวนคอร์สของอาจารย์: ${instructorCourses.length}`);
    instructorCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (ID: ${course.id})`);
    });
    console.log('');

    const courseIds = instructorCourses.map(course => course.id);

    if (courseIds.length === 0) {
      console.log('❌ ไม่พบคอร์ส - API จะ return 0 ทุกค่า');
      return;
    }

    // Test stats API logic (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    console.log(`📅 ช่วงเวลา: ${startDate.toLocaleDateString('th-TH')} - ${endDate.toLocaleDateString('th-TH')}\n`);

    // Count orders
    const totalOrders = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: {
          in: courseIds
        },
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    });

    const completedOrders = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: {
          in: courseIds
        },
        order: {
          status: 'COMPLETED',
          payment: {
            status: 'COMPLETED'
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    });

    console.log('📊 Stats API จะ return:');
    console.log(`   Total Orders (last 30 days): ${totalOrders}`);
    console.log(`   Completed Orders (last 30 days): ${completedOrders}`);
    console.log('');

    // Test course sales API logic
    console.log('💰 Course Sales API จะ return:');
    
    for (const course of instructorCourses) {
      const salesCount = await prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: course.id,
          order: {
            status: 'COMPLETED',
            payment: {
              status: 'COMPLETED'
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      });

      const orderItems = await prisma.orderItem.findMany({
        where: {
          itemType: 'COURSE',
          itemId: course.id,
          order: {
            status: 'COMPLETED',
            payment: {
              status: 'COMPLETED'
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        select: {
          totalPrice: true
        }
      });

      const totalRevenue = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

      console.log(`   - ${course.title}`);
      console.log(`     Sales: ${salesCount}, Revenue: ${totalRevenue.toLocaleString()} บาท`);
    }
    console.log('');

    // Test all time stats
    console.log('📈 ข้อมูลทั้งหมด (All Time):');
    
    const allTimeSales = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: {
          in: courseIds
        },
        order: {
          status: 'COMPLETED',
          payment: {
            status: 'COMPLETED'
          }
        }
      }
    });

    const allTimeOrders = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: {
          in: courseIds
        },
        order: {
          status: 'COMPLETED',
          payment: {
            status: 'COMPLETED'
          }
        }
      },
      select: {
        totalPrice: true
      }
    });

    const allTimeRevenue = allTimeOrders.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    console.log(`   Total Sales (All Time): ${allTimeSales}`);
    console.log(`   Total Revenue (All Time): ${allTimeRevenue.toLocaleString()} บาท`);

    if (totalOrders === 0 && allTimeSales > 0) {
      console.log('\n⚠️  ปัญหาพบแล้ว!');
      console.log('   - มียอดขายทั้งหมด แต่ไม่มียอดขายใน 30 วันล่าสุด');
      console.log('   - Dashboard แสดง 0 เพราะ default period = 30 วัน');
      console.log('   - ลอง filter ด้วย period ที่ยาวขึ้น เช่น 90 หรือ 365 วัน');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testInstructorAPI();
