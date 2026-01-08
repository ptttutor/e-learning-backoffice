import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // หา courses ของ instructor
    const instructorCourses = await prisma.course.findMany({
      where: {
        instructorId: instructorId
      },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true
      }
    });

    const courseIds = instructorCourses.map(course => course.id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // ดึงข้อมูลยอดขายแต่ละ course จาก OrderItem
    const courseSalesData = await Promise.all(
      instructorCourses.map(async (course) => {
        // นับจำนวน orders ที่สำเร็จ
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

        // คำนวณยอดขายรวม
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

        return {
          courseId: course.id,
          courseName: course.title,
          price: course.discountPrice || course.price,
          salesCount: salesCount,
          revenue: totalRevenue
        };
      })
    );

    // เรียงตามยอดขายมากไปน้อย
    const sortedData = courseSalesData.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: sortedData
    });

  } catch (error) {
    console.error('Error fetching instructor course sales:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยอดขายคอร์ส' },
      { status: 500 }
    );
  }
}
