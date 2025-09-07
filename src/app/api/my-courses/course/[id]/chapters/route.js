import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/my-courses/course/[id]/chapters - ดึงรายการ chapters ทั้งหมดของคอร์ส
export async function GET(req, { params }) {
  try {
    const { id: courseId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const includeContents = searchParams.get('includeContents') === 'true';
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่าคอร์สมีอยู่จริง
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        status: true,
        isFree: true,
        instructorId: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" }, 
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์เข้าถึง (ถ้ามี userId)
    let hasAccess = true;
    if (userId) {
      const accessCheck = await checkCourseAccess(userId, courseId, course);
      hasAccess = accessCheck.hasAccess;
      
      if (!hasAccess) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Access denied", 
            reason: accessCheck.reason 
          }, 
          { status: 403 }
        );
      }
    }

    // ดึงรายการ chapters
    const chapters = await prisma.chapter.findMany({
      where: { courseId: courseId },
      include: includeContents ? {
        contents: {
          orderBy: { order: 'asc' }
        }
      } : {
        _count: {
          select: {
            contents: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // สร้างข้อมูลสรุป
    const totalChapters = chapters.length;
    const totalContents = includeContents 
      ? chapters.reduce((total, chapter) => total + chapter.contents.length, 0)
      : chapters.reduce((total, chapter) => total + chapter._count.contents, 0);

    const responseData = {
      course: {
        id: course.id,
        title: course.title
      },
      chapters: chapters,
      stats: {
        totalChapters,
        totalContents
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: responseData
    });
    
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// Helper function สำหรับตรวจสอบสิทธิ์เข้าถึงคอร์ส
async function checkCourseAccess(userId, courseId, course = null) {
  try {
    if (!course) {
      course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          isFree: true,
          status: true,
          instructorId: true
        }
      });
    }

    if (!course) {
      return { hasAccess: false, reason: 'COURSE_NOT_FOUND' };
    }

    // ถ้าไม่ได้เผยแพร่และไม่ใช่ instructor
    if (course.status !== 'PUBLISHED' && course.instructorId !== userId) {
      return { hasAccess: false, reason: 'COURSE_NOT_PUBLISHED' };
    }

    // ถ้าเป็น instructor
    if (course.instructorId === userId) {
      return { hasAccess: true, accessType: 'INSTRUCTOR' };
    }

    // ถ้าเป็นคอร์สฟรี
    if (course.isFree) {
      return { hasAccess: true, accessType: 'FREE_COURSE' };
    }

    // ตรวจสอบ enrollment สำหรับคอร์สเสียเงิน
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      return { hasAccess: false, reason: 'NOT_ENROLLED' };
    }

    return { hasAccess: true, accessType: 'ENROLLED' };
    
  } catch (error) {
    console.error('Error checking course access:', error);
    return { hasAccess: false, reason: 'ERROR' };
  }
}
