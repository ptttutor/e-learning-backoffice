import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงสถิติสำหรับ dashboard
export async function GET(request) {
  try {
    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue (only completed orders)
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      }
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'STUDENT'
      }
    });

    // Get total products (ebooks + courses)
    const [totalEbooks, totalCourses] = await Promise.all([
      prisma.ebook.count({
        where: {
          isActive: true
        }
      }),
      prisma.course.count({
        where: {
          status: 'PUBLISHED'
        }
      })
    ]);
    const totalProducts = totalEbooks + totalCourses;

    // Get pending orders (waiting for payment verification)
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING_PAYMENT'
      }
    });

    // Get completed orders
    const completedOrders = await prisma.order.count({
      where: {
        status: 'COMPLETED'
      }
    });

    // Get orders by payment method
    const paymentMethods = await prisma.payment.groupBy({
      by: ['method'],
      _count: {
        method: true
      }
    });

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        total: true
      }
    });

    // Process monthly revenue data
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthRevenue = monthlyRevenue
        .filter(item => {
          const itemDate = new Date(item.createdAt);
          const itemMonthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          return itemMonthKey === monthKey;
        })
        .reduce((sum, item) => sum + (item._sum.total || 0), 0);

      monthlyRevenueData.push({
        month: date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short' }),
        revenue: monthRevenue
      });
    }

    // Get top selling products
    const topEbooks = await prisma.order.groupBy({
      by: ['ebookId'],
      where: {
        status: 'COMPLETED',
        orderType: 'EBOOK',
        ebookId: {
          not: null
        }
      },
      _count: {
        ebookId: true
      },
      orderBy: {
        _count: {
          ebookId: 'desc'
        }
      },
      take: 5
    });

    const topCourses = await prisma.order.groupBy({
      by: ['courseId'],
      where: {
        status: 'COMPLETED',
        orderType: 'COURSE',
        courseId: {
          not: null
        }
      },
      _count: {
        courseId: true
      },
      orderBy: {
        _count: {
          courseId: 'desc'
        }
      },
      take: 5
    });

    // Get product details for top selling items
    const topEbookDetails = await Promise.all(
      topEbooks.map(async (item) => {
        const ebook = await prisma.ebook.findUnique({
          where: { id: item.ebookId },
          select: { id: true, title: true, author: true, coverImageUrl: true }
        });
        return {
          ...ebook,
          type: 'ebook',
          sales: item._count.ebookId
        };
      })
    );

    const topCourseDetails = await Promise.all(
      topCourses.map(async (item) => {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: { 
            id: true, 
            title: true, 
            instructor: { 
              select: { name: true } 
            } 
          }
        });
        return {
          ...course,
          type: 'course',
          sales: item._count.courseId
        };
      })
    );

    const topProducts = [...topEbookDetails, ...topCourseDetails]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        pendingOrders,
        completedOrders,
        paymentMethods,
        monthlyRevenue: monthlyRevenueData,
        topProducts
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    );
  }
}