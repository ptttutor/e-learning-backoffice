import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // สถิติ Orders
    const [totalOrders, completedOrders, pendingOrders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.order.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PENDING_PAYMENT', 'PENDING_VERIFICATION']
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    // สถิติรายได้
    const revenueData = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      }
    });

    // สถิติ Users
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    // สถิติ Courses
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      prisma.course.count({
        where: {
          status: 'DRAFT'
        }
      })
    ]);

    // สถิติ E-book
    const [totalEbooks, publishedEbooks] = await Promise.all([
      prisma.ebook.count(),
      prisma.ebook.count({
        where: {
          isActive: true
        }
      })
    ]);

    // สถิติ Enrollments
    const [totalEnrollments, activeEnrollments] = await Promise.all([
      prisma.enrollment.count({
        where: {
          enrolledAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.enrollment.count({
        where: {
          status: 'ACTIVE',
          enrolledAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    // Revenue trend (รายได้ 7 วันล่าสุด)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dailyRevenue = await prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        _sum: {
          total: true
        }
      });

      revenueTrend.push({
        date: date.toISOString().split('T')[0],
        revenue: dailyRevenue._sum.total || 0
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        stats: {
          orders: {
            total: totalOrders,
            completed: completedOrders,
            pending: pendingOrders
          },
          revenue: {
            total: revenueData._sum.total || 0,
            trend: revenueTrend
          },
          users: {
            total: totalUsers,
            new: newUsers
          },
          courses: {
            total: totalCourses,
            published: publishedCourses,
            draft: draftCourses
          },
          ebooks: {
            total: totalEbooks,
            published: publishedEbooks
          },
          enrollments: {
            total: totalEnrollments,
            active: activeEnrollments
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
