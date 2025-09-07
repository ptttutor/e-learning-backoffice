import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/my-courses/course/[id]/chapters/[chapterId] - ดึงข้อมูล chapter เฉพาะพร้อม contents
export async function GET(req, { params }) {
  try {
    const { id: courseId, chapterId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!courseId || !chapterId) {
      return NextResponse.json(
        { success: false, error: "Course ID and Chapter ID are required" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์เข้าถึงคอร์สก่อน (ถ้ามี userId)
    if (userId) {
      const courseAccess = await checkCourseAccess(userId, courseId);
      if (!courseAccess.hasAccess) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Access denied", 
            reason: courseAccess.reason 
          }, 
          { status: 403 }
        );
      }
    }

    // ดึงข้อมูล chapter พร้อม contents
    const chapter = await prisma.chapter.findFirst({
      where: { 
        id: chapterId,
        courseId: courseId
      },
      include: {
        contents: {
          orderBy: { order: 'asc' }
        },
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            isFree: true,
            status: true
          }
        }
      }
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" }, 
        { status: 404 }
      );
    }

    // ดึงข้อมูล chapters อื่นๆ ในคอร์สเดียวกัน (สำหรับ navigation)
    const allChapters = await prisma.chapter.findMany({
      where: { courseId: courseId },
      select: {
        id: true,
        title: true,
        order: true
      },
      orderBy: { order: 'asc' }
    });

    // หา chapter ก่อนหน้าและถัดไป
    const currentIndex = allChapters.findIndex(c => c.id === chapterId);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    const responseData = {
      ...chapter,
      navigation: {
        allChapters,
        prevChapter,
        nextChapter,
        currentIndex: currentIndex + 1,
        totalChapters: allChapters.length
      }
    };

    return NextResponse.json({ 
      success: true, 
      chapter: responseData
    });
    
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// Helper function สำหรับตรวจสอบสิทธิ์เข้าถึงคอร์ส
async function checkCourseAccess(userId, courseId) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        isFree: true,
        status: true,
        instructorId: true
      }
    });

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
