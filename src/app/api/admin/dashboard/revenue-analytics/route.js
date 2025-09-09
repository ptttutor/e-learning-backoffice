import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 12; // months

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));

    // ดึงข้อมูลรายได้แยกตามเดือน
    const monthlyRevenue = [];
    
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - i);
      
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const monthlyData = await prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          total: true
        },
        _count: {
          id: true
        }
      });

      monthlyRevenue.push({
        month: currentDate.toISOString().slice(0, 7), // YYYY-MM format
        monthName: currentDate.toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'long' 
        }),
        revenue: monthlyData._sum.total || 0,
        orders: monthlyData._count.id || 0
      });
    }

    // ดึงข้อมูลรายได้แยกตาม category
    const categoryRevenue = await prisma.order.groupBy({
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

    // ดึงข้อมูล category
    const courseIds = categoryRevenue.map(item => item.courseId);
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds
        }
      },
      include: {
        category: true
      }
    });

    // จัดกลุ่มตาม category
    const categoryStats = {};
    categoryRevenue.forEach(item => {
      const course = courses.find(c => c.id === item.courseId);
      const categoryName = course?.category?.name || 'ไม่ระบุหมวดหมู่';
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          category: categoryName,
          revenue: 0,
          orders: 0,
          courses: new Set()
        };
      }
      
      categoryStats[categoryName].revenue += item._sum.total || 0;
      categoryStats[categoryName].orders += item._count.id || 0;
      categoryStats[categoryName].courses.add(item.courseId);
    });

    // แปลงเป็น array และเพิ่ม course count
    const categoryRevenueData = Object.values(categoryStats).map(item => ({
      category: item.category,
      revenue: item.revenue,
      orders: item.orders,
      courseCount: item.courses.size
    })).sort((a, b) => b.revenue - a.revenue);

    // Top instructors
    const instructorRevenue = await prisma.order.groupBy({
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

    // ดึงข้อมูล instructor
    const instructorStats = {};
    for (const item of instructorRevenue) {
      const course = await prisma.course.findUnique({
        where: { id: item.courseId },
        include: {
          instructor: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (course?.instructor) {
        const instructorId = course.instructor.id;
        const instructorName = course.instructor.name || 'ไม่ระบุชื่อ';
        
        if (!instructorStats[instructorId]) {
          instructorStats[instructorId] = {
            instructorId,
            instructorName,
            revenue: 0,
            orders: 0,
            courses: new Set()
          };
        }
        
        instructorStats[instructorId].revenue += item._sum.total || 0;
        instructorStats[instructorId].orders += item._count.id || 0;
        instructorStats[instructorId].courses.add(item.courseId);
      }
    }

    const topInstructors = Object.values(instructorStats).map(item => ({
      instructorId: item.instructorId,
      instructorName: item.instructorName,
      revenue: item.revenue,
      orders: item.orders,
      courseCount: item.courses.size
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        monthlyRevenue,
        categoryRevenue: categoryRevenueData,
        topInstructors
      }
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics data' },
      { status: 500 }
    );
  }
}
