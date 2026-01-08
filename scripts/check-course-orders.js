// Script เช็คจำนวน orders ของ course ที่มี payment status = COMPLETED
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourseOrders() {
  try {
    const courseId = '1fe8a20d-ef3f-46e9-9900-aea628cd180e';
    
    console.log('🔍 กำลังตรวจสอบ course ID:', courseId);
    console.log('');

    // ดึงข้อมูล course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true
      }
    });

    if (!course) {
      console.log('❌ ไม่พบ course นี้');
      return;
    }

    console.log('📚 ข้อมูล Course:');
    console.log(`   Title: ${course.title}`);
    console.log(`   Price: ${course.price} บาท`);
    if (course.discountPrice) {
      console.log(`   Discount Price: ${course.discountPrice} บาท`);
    }
    console.log('');

    // นับจำนวน orders ที่มี payment status = COMPLETED
    const completedOrdersCount = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: courseId,
        order: {
          payment: {
            status: 'COMPLETED'
          }
        }
      }
    });

    console.log('✅ จำนวนผู้เรียนที่ชำระเงินสำเร็จ:', completedOrdersCount);
    console.log('');

    // ดึงรายละเอียด orders ที่ชำระเงินสำเร็จ
    const completedOrders = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: courseId,
        order: {
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
            payment: {
              select: {
                status: true,
                amount: true,
                paidAt: true
              }
            },
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📋 รายละเอียด Orders ที่ชำระเงินสำเร็จ:');
    console.log('─'.repeat(80));
    
    completedOrders.forEach((item, index) => {
      console.log(`${index + 1}. Order #${item.order.orderNumber}`);
      console.log(`   ผู้ซื้อ: ${item.order.user?.name || 'N/A'} (${item.order.user?.email || 'N/A'})`);
      console.log(`   จำนวนเงิน: ${item.order.payment?.amount || item.order.total} บาท`);
      console.log(`   วันที่ชำระ: ${item.order.payment?.paidAt ? new Date(item.order.payment.paidAt).toLocaleString('th-TH') : 'N/A'}`);
      console.log('');
    });

    // นับ orders ทั้งหมด (รวมทุก status)
    const allOrdersCount = await prisma.orderItem.count({
      where: {
        itemType: 'COURSE',
        itemId: courseId
      }
    });

    console.log('─'.repeat(80));
    console.log('📊 สรุป:');
    console.log(`   Orders ทั้งหมด: ${allOrdersCount}`);
    console.log(`   ชำระเงินสำเร็จ: ${completedOrdersCount}`);
    console.log(`   รอดำเนินการ/ยกเลิก: ${allOrdersCount - completedOrdersCount}`);

    // แสดง breakdown ตาม payment status
    const ordersByStatus = await prisma.orderItem.findMany({
      where: {
        itemType: 'COURSE',
        itemId: courseId
      },
      include: {
        order: {
          select: {
            payment: {
              select: {
                status: true
              }
            }
          }
        }
      }
    });

    const statusCount = {};
    ordersByStatus.forEach(item => {
      const status = item.order?.payment?.status || 'NO_PAYMENT';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    console.log('');
    console.log('📈 แยกตาม Payment Status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseOrders();
