import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

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
        data: []
      });
    }

    // ดึง orders ที่เกี่ยวข้องกับคอร์สของ instructor
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        payment: {
          status: 'COMPLETED'
        },
        items: {
          some: {
            itemType: 'COURSE',
            itemId: {
              in: courseIds
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payment: {
          select: {
            amount: true,
            paidAt: true,
            status: true
          }
        },
        items: {
          where: {
            itemType: 'COURSE',
            itemId: {
              in: courseIds
            }
          },
          select: {
            id: true,
            itemType: true,
            itemId: true,
            title: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching instructor orders:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}
