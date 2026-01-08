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
        id: true
      }
    });

    const courseIds = instructorCourses.map(course => course.id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          courseRevenue: 0,
          ebookRevenue: 0,
          averageOrderValue: 0,
          totalCourses: 0,
          totalEbooks: 0,
          totalUsers: 0,
          newUsersThisPeriod: 0
        }
      });
    }

    // สถิติ Orders ของคอร์สที่ instructor สอน (จาก OrderItem)
    const [totalOrders, completedOrders, pendingOrders] = await Promise.all([
      prisma.orderItem.count({
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
      }),
      prisma.orderItem.count({
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
      }),
      prisma.orderItem.count({
        where: {
          itemType: 'COURSE',
          itemId: {
            in: courseIds
          },
          order: {
            status: {
              in: ['PENDING', 'PENDING_PAYMENT', 'PENDING_VERIFICATION']
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      })
    ]);

    // สถิติรายได้จากคอร์สของ instructor (จาก OrderItem)
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
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      select: {
        totalPrice: true,
        order: {
          select: {
            total: true
          }
        }
      }
    });

    const totalRevenue = orderItemsRevenue.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // จำนวน courses ของ instructor
    const totalCourses = courseIds.length;

    // จำนวนผู้เรียนที่ซื้อคอร์สของ instructor (unique users)
    const uniqueUsers = await prisma.orderItem.findMany({
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
        order: {
          select: {
            userId: true
          }
        }
      },
      distinct: ['orderId']
    });

    const uniqueUserIds = [...new Set(uniqueUsers.map(item => item.order.userId))];
    const totalUsers = uniqueUserIds.length;

    // ผู้เรียนใหม่ในช่วงเวลาที่เลือก
    const newUsers = await prisma.orderItem.findMany({
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
      },
      select: {
        order: {
          select: {
            userId: true
          }
        }
      },
      distinct: ['orderId']
    });

    const newUserIds = [...new Set(newUsers.map(item => item.order.userId))];
    const newUsersThisPeriod = newUserIds.length;

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue: totalRevenue,
        courseRevenue: totalRevenue,
        ebookRevenue: 0,
        averageOrderValue,
        totalCourses,
        totalEbooks: 0,
        totalUsers,
        newUsersThisPeriod
      }
    });

  } catch (error) {
    console.error('Error fetching instructor dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    );
  }
}
