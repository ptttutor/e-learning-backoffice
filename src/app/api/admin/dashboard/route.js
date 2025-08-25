import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/dashboard - ดึงข้อมูลสำหรับ Dashboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // สถิติพื้นฐาน
    const [
      totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue,
      newUsersThisPeriod,
      newOrdersThisPeriod,
      revenueThisPeriod,
      activeEnrollments
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total courses
      prisma.course.count({ where: { isPublished: true } }),
      
      // Total orders
      prisma.order.count({ where: { status: 'paid' } }),
      
      // Total revenue
      prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { finalAmount: true }
      }),
      
      // New users this period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // New orders this period
      prisma.order.count({
        where: {
          status: 'paid',
          completedAt: { gte: startDate }
        }
      }),
      
      // Revenue this period
      prisma.order.aggregate({
        where: {
          status: 'paid',
          completedAt: { gte: startDate }
        },
        _sum: { finalAmount: true }
      }),
      
      // Active enrollments
      prisma.courseEnrollment.count({
        where: { isActive: true }
      })
    ])

    // สถิติตามสถานะออเดอร์
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { finalAmount: true }
    })

    // สถิติผู้ใช้ตาม role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    // คอร์สยอดนิยม (Top 10)
    const popularCourses = await prisma.course.findMany({
      take: 10,
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      }
    })

    // รายได้รายเดือน (6 เดือนล่าสุด)
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', completed_at) as month,
        COUNT(*) as order_count,
        SUM(final_amount) as revenue
      FROM orders 
      WHERE status = 'paid' 
        AND completed_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', completed_at)
      ORDER BY month DESC
    `

    // ผู้ใช้ใหม่รายวัน (30 วันล่าสุด)
    const dailyNewUsers = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as user_count
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `

    // รีวิวล่าสุด
    const recentReviews = await prisma.courseReview.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // ออเดอร์ที่รอการอนุมัติ
    const pendingOrders = await prisma.order.count({
      where: { status: 'processing' }
    })

    // Payment receipts ที่รอการตรวจสอบ
    const pendingReceipts = await prisma.paymentReceipt.count({
      where: { status: 'pending' }
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalOrders,
          totalRevenue: totalRevenue._sum.finalAmount || 0,
          newUsersThisPeriod,
          newOrdersThisPeriod,
          revenueThisPeriod: revenueThisPeriod._sum.finalAmount || 0,
          activeEnrollments,
          pendingOrders,
          pendingReceipts
        },
        charts: {
          ordersByStatus: ordersByStatus.map(item => ({
            status: item.status,
            count: item._count.status,
            revenue: item._sum.finalAmount || 0
          })),
          usersByRole: usersByRole.map(item => ({
            role: item.role,
            count: item._count.role
          })),
          monthlyRevenue: monthlyRevenue.map(item => ({
            month: item.month,
            orderCount: Number(item.order_count),
            revenue: Number(item.revenue)
          })),
          dailyNewUsers: dailyNewUsers.map(item => ({
            date: item.date,
            userCount: Number(item.user_count)
          }))
        },
        lists: {
          popularCourses: popularCourses.map(course => ({
            id: course.id,
            title: course.title,
            teacher: `${course.teacher?.firstName} ${course.teacher?.lastName}`,
            enrollmentCount: course._count.enrollments,
            reviewCount: course._count.reviews,
            price: course.price
          })),
          recentReviews: recentReviews.map(review => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            user: `${review.user.firstName} ${review.user.lastName}`,
            course: review.course.title,
            createdAt: review.createdAt
          }))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data', error: error.message },
      { status: 500 }
    )
  }
}