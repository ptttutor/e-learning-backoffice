import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: /api/enrollment - สร้าง enrollment เมื่อซื้อคอร์สสำเร็จ
export async function POST(req) {
  try {
    const { userId, courseId, orderId } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "userId and courseId are required" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี enrollment อยู่แล้วหรือไม่
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      // อัพเดท status เป็น ACTIVE ถ้ายัง inactive อยู่
      const updatedEnrollment = await prisma.enrollment.update({
        where: {
          id: existingEnrollment.id
        },
        data: {
          status: 'ACTIVE',
          enrolledAt: new Date()
        },
        include: {
          course: {
            include: {
              instructor: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment activated',
        enrollment: updatedEnrollment
      });
    }

    // สร้าง enrollment ใหม่
    const newEnrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
        enrolledAt: new Date()
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment created successfully',
      enrollment: newEnrollment
    });
    
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// PUT: /api/enrollment - อัพเดท progress
export async function PUT(req) {
  try {
    const { userId, courseId, progress } = await req.json();
    
    if (!userId || !courseId || progress === undefined) {
      return NextResponse.json(
        { success: false, error: "userId, courseId, and progress are required" }, 
        { status: 400 }
      );
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progress: Math.min(Math.max(progress, 0), 100), // จำกัด 0-100
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment
    });
    
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE: /api/enrollment - ยกเลิก enrollment
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "userId and courseId are required" }, 
        { status: 400 }
      );
    }

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'CANCELED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
