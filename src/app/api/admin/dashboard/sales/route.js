import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, month, year

    // สถิติรวม
    const totalStats = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      },
      _count: true
    });

    // ยอดขายรายวัน (30 วันล่าสุด)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as total_amount,
        COUNT(*) as order_count
      FROM "Order" 
      WHERE status = 'COMPLETED' 
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // ยอดขายรายเดือน (12 เดือนล่าสุด)
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as total_amount,
        COUNT(*) as order_count
      FROM "Order" 
      WHERE status = 'COMPLETED' 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;

    // ยอดขายแยกตาม Course
    const courseSales = await prisma.order.groupBy({
      by: ['courseId'],
      where: {
        status: 'COMPLETED',
        orderType: 'COURSE',
        courseId: { not: null }
      },
      _sum: {
        total: true
      },
      _count: true
    });

    // ดึงข้อมูล Course titles
    const courseIds = courseSales.map(sale => sale.courseId).filter(Boolean);
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds }
      },
      select: {
        id: true,
        title: true,
        price: true
      }
    });

    const courseStatsWithNames = courseSales.map(stat => {
      const course = courses.find(c => c.id === stat.courseId);
      return {
        ...stat,
        title: course?.title || 'Unknown Course',
        price: course?.price || 0
      };
    }).sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0));

    // ยอดขายแยกตาม Ebook
    const ebookSales = await prisma.order.groupBy({
      by: ['ebookId'],
      where: {
        status: 'COMPLETED',
        orderType: 'EBOOK',
        ebookId: { not: null }
      },
      _sum: {
        total: true
      },
      _count: true
    });

    // ดึงข้อมูล Ebook titles
    const ebookIds = ebookSales.map(sale => sale.ebookId).filter(Boolean);
    const ebooks = await prisma.ebook.findMany({
      where: {
        id: { in: ebookIds }
      },
      select: {
        id: true,
        title: true,
        price: true,
        author: true
      }
    });

    const ebookStatsWithNames = ebookSales.map(stat => {
      const ebook = ebooks.find(e => e.id === stat.ebookId);
      return {
        ...stat,
        title: ebook?.title || 'Unknown Ebook',
        author: ebook?.author || 'Unknown Author',
        price: ebook?.price || 0
      };
    }).sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0));

    // Top selling items ทั้งหมด
    const topSellingItems = await prisma.orderItem.groupBy({
      by: ['itemType', 'itemId', 'title'],
      _sum: {
        totalPrice: true,
        quantity: true
      },
      _count: true,
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 10
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        },
        ebook: {
          select: {
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStats: {
          totalRevenue: Number(totalStats._sum.total) || 0,
          totalOrders: totalStats._count || 0
        },
        dailySales: dailySales.map(item => ({
          date: item.date,
          amount: Number(item.total_amount) || 0,
          orders: Number(item.order_count) || 0
        })),
        monthlyStats: monthlyStats.map(item => ({
          month: item.month,
          amount: Number(item.total_amount) || 0,
          orders: Number(item.order_count) || 0
        })),
        courseSales: courseStatsWithNames,
        ebookSales: ebookStatsWithNames,
        topSellingItems,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch dashboard data"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
