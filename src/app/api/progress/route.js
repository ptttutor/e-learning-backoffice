import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/progress?userId=xxx&courseId=xxx - ดึงข้อมูล progress
export async function GET(req) {
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

    // ดึงข้อมูล enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      include: {
        course: {
          select: {
            title: true,
            chapters: {
              include: {
                contents: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" }, 
        { status: 404 }
      );
    }

    // คำนวณสถิติ
    const totalContents = enrollment.course.chapters.reduce((total, chapter) => 
      total + chapter.contents.length, 0
    );

    const completedContents = Math.round((enrollment.progress / 100) * totalContents);

    return NextResponse.json({ 
      success: true, 
      data: {
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        totalContents: totalContents,
        completedContents: completedContents,
        courseTitle: enrollment.course.title
      }
    });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// PUT: /api/progress - รีเซ็ต progress
export async function PUT(req) {
  try {
    const { userId, courseId, progress = 0 } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "userId and courseId are required" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี enrollment หรือไม่
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" }, 
        { status: 404 }
      );
    }

    // อัพเดท progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      data: {
        progress: Math.max(0, Math.min(100, progress)),
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      progress: updatedEnrollment.progress,
      status: updatedEnrollment.status,
      message: `Progress updated to ${updatedEnrollment.progress}%`
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
