import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/my-courses/course/[id]/exams - ดึงข้อสอบในคอร์ส
export async function GET(req, { params }) {
  try {
    const { id } = params; // courseId
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" }, 
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่า user ลงทะเบียนคอร์สนี้หรือไม่
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: id,
        userId: userId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'คุณยังไม่ได้ลงทะเบียนคอร์สนี้' },
        { status: 403 }
      );
    }

    // ดึงข้อสอบในคอร์สนี้
    const exams = await prisma.exam.findMany({
      where: {
        courseId: id,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        _count: {
          select: {
            questions: true
          }
        },
        attempts: {
          where: { userId },
          select: {
            id: true,
            status: true,
            percentage: true,
            passed: true,
            completedAt: true,
            startedAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // จัดรูปแบบข้อมูล
    const formattedExams = exams.map(exam => {
      const attempt = exam.attempts[0]; // เอาครั้งแรกที่พบ
      
      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        examType: exam.examType,
        duration: exam.duration,
        course: exam.course,
        totalQuestions: exam._count.questions,
        status: attempt ? attempt.status : 'NOT_STARTED',
        canRetake: !attempt || attempt.status !== 'COMPLETED',
        lastAttempt: attempt ? {
          id: attempt.id,
          status: attempt.status,
          percentage: attempt.percentage,
          passed: attempt.passed,
          completedAt: attempt.completedAt,
          startedAt: attempt.startedAt,
        } : null,
        createdAt: exam.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      exams: formattedExams,
      count: formattedExams.length
    });

  } catch (error) {
    console.error('Error fetching course exams:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
