import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/course-access?userId=xxx&courseId=xxx - ตรวจสอบสิทธิ์เข้าถึงคอร์ส
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

    // ตรวจสอบคอร์ส
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        isFree: true,
        status: true,
        instructorId: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" }, 
        { status: 404 }
      );
    }

    // ถ้าคอร์สไม่ได้เผยแพร่
    if (course.status !== 'PUBLISHED') {
      // เฉพาะ instructor เท่านั้นที่เข้าได้
      if (course.instructorId !== userId) {
        return NextResponse.json({
          success: false,
          hasAccess: false,
          reason: 'COURSE_NOT_PUBLISHED',
          message: 'Course is not published yet'
        });
      }
    }

    // ถ้าเป็น instructor ของคอร์สนี้
    if (course.instructorId === userId) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        accessType: 'INSTRUCTOR',
        course: course
      });
    }

    // ถ้าคอร์สฟรี
    if (course.isFree) {
      // ตรวจสอบว่ามี enrollment หรือไม่
      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      });

      // ถ้าไม่มี enrollment ให้สร้างใหม่
      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            userId,
            courseId,
            status: 'ACTIVE',
            progress: 0,
            enrolledAt: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        hasAccess: true,
        accessType: 'FREE_COURSE',
        enrollment: enrollment,
        course: course
      });
    }

    // ถ้าคอร์สเสียเงิน ตรวจสอบ enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        reason: 'NOT_ENROLLED',
        message: 'You need to purchase this course to access it',
        course: course
      });
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      accessType: 'PAID_COURSE',
      enrollment: enrollment,
      course: course
    });
    
  } catch (error) {
    console.error('Error checking course access:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
