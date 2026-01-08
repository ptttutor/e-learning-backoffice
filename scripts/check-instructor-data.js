// Script เช็คข้อมูล instructor และ courses
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstructorData() {
  try {
    const instructorId = '25359b4b-0ec1-421b-8766-6df9ead5865f';
    
    console.log('🔍 กำลังตรวจสอบ instructor ID:', instructorId);
    console.log('');

    // ดึงข้อมูล user
    const user = await prisma.user.findUnique({
      where: { id: instructorId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      console.log('❌ ไม่พบ user นี้');
      return;
    }

    console.log('👤 ข้อมูล User:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('');

    // ดึง courses ของ instructor
    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructorId
      },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true,
        status: true
      }
    });

    console.log(`📚 จำนวนคอร์สทั้งหมด: ${courses.length}`);
    console.log('─'.repeat(80));
    
    if (courses.length === 0) {
      console.log('⚠️  ไม่พบคอร์สของ instructor นี้');
      return;
    }

    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Price: ${course.price} บาท`);
      if (course.discountPrice) {
        console.log(`   Discount: ${course.discountPrice} บาท`);
      }
      console.log(`   Status: ${course.status}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('');

    // เช็คยอดขายแต่ละคอร์ส
    for (const course of courses) {
      console.log(`🔍 เช็คยอดขาย: ${course.title}`);
      
      // นับ orders จาก OrderItem
      const orderItems = await prisma.orderItem.findMany({
        where: {
          itemType: 'COURSE',
          itemId: course.id,
          order: {
            status: 'COMPLETED',
            payment: {
              status: 'COMPLETED'
            }
          }
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      console.log(`   จำนวนขาย: ${orderItems.length} รายการ`);
      
      if (orderItems.length > 0) {
        const totalRevenue = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        console.log(`   รายได้รวม: ${totalRevenue} บาท`);
        console.log('   รายละเอียด:');
        orderItems.forEach((item, idx) => {
          console.log(`     ${idx + 1}. Order #${item.order.orderNumber}`);
          console.log(`        ผู้ซื้อ: ${item.order.user?.name || 'N/A'}`);
          console.log(`        ราคา: ${item.totalPrice} บาท`);
          console.log(`        วันที่: ${new Date(item.order.createdAt).toLocaleDateString('th-TH')}`);
        });
      } else {
        console.log('   ⚠️  ยังไม่มียอดขาย');
      }
      console.log('');
    }

    // เช็คว่า API endpoint จะได้ข้อมูลหรือไม่
    console.log('─'.repeat(80));
    console.log('📊 ทดสอบ API Logic:');
    console.log('');

    const courseIds = courses.map(c => c.id);
    
    // นับ orders รวม
    const totalOrderItems = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: {
          in: courseIds
        },
        order: {
          payment: {
            status: 'COMPLETED'
          }
        }
      }
    });

    console.log(`✅ Total order items (COMPLETED payment): ${totalOrderItems}`);

    // นับ completed orders
    const completedOrderItems = await prisma.orderItem.count({
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

    console.log(`✅ Completed order items: ${completedOrderItems}`);

    // คำนวณรายได้
    const orderItemsRevenue = await prisma.orderItem.findMany({
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

    const totalRevenue = orderItemsRevenue.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    console.log(`✅ Total revenue: ${totalRevenue} บาท`);

    console.log('');
    console.log('─'.repeat(80));

    if (totalOrderItems === 0) {
      console.log('⚠️  สาเหตุที่ไม่มีข้อมูล:');
      console.log('   1. ยังไม่มีคำสั่งซื้อที่ชำระเงินสำเร็จ');
      console.log('   2. หรือ instructorId ในตาราง Course ไม่ตรงกับ userId');
      console.log('');
      console.log('💡 แนะนำ:');
      console.log('   - ตรวจสอบว่า course.instructorId ตรงกับ user.id หรือไม่');
      console.log('   - ตรวจสอบว่ามี order ที่มี payment.status = "COMPLETED" หรือไม่');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstructorData();
