import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // ดึงข้อมูลยอดขายแต่ละ course
    const courseSales = await prisma.order.groupBy({
      by: ['courseId'],
      where: {
        courseId: {
          not: null
        },
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // ดึงข้อมูล course details
    const courseIds = courseSales.map(sale => sale.courseId);
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds
        }
      },
      include: {
        instructor: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // รวมข้อมูล
    const salesData = courseSales.map(sale => {
      const course = courses.find(c => c.id === sale.courseId);
      return {
        courseId: sale.courseId,
        courseName: course?.title || 'Unknown Course',
        instructor: course?.instructor?.name || 'Unknown Instructor',
        category: course?.category?.name || 'No Category',
        totalSales: sale._sum.total || 0,
        totalOrders: sale._count.id || 0,
        averageOrderValue: sale._sum.total && sale._count.id 
          ? (sale._sum.total / sale._count.id) 
          : 0
      };
    });

    // เรียงลำดับตามยอดขาย
    salesData.sort((a, b) => b.totalSales - a.totalSales);

    // คำนวณสถิติรวม
    const totalRevenue = salesData.reduce((sum, item) => sum + item.totalSales, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.totalOrders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalCourses: salesData.length
        },
        courseSales: salesData
      }
    });

  } catch (error) {
    console.error('Error fetching course sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course sales data' },
      { status: 500 }
    );
  }
}
