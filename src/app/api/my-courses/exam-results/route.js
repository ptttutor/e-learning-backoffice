import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - ดึงประวัติการทำข้อสอบทั้งหมดของ user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status'); // 'COMPLETED', 'IN_PROGRESS'
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ User ID' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    let whereCondition = {
      userId: userId,
    };

    if (courseId) {
      whereCondition.exam = {
        courseId: courseId
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // นับจำนวนทั้งหมด
    const totalCount = await prisma.examAttempt.count({
      where: whereCondition
    });

    // ดึงข้อมูลประวัติการทำข้อสอบ
    const attempts = await prisma.examAttempt.findMany({
      where: whereCondition,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            examType: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
    });

    // จัดรูปแบบข้อมูล
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      totalMarks: attempt.totalMarks,
      obtainedMarks: attempt.obtainedMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      exam: attempt.exam,
      duration: attempt.completedAt && attempt.startedAt 
        ? Math.round((new Date(attempt.completedAt) - new Date(attempt.startedAt)) / (1000 * 60)) // นาที
        : null
    }));

    // คำนวณ pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      attempts: formattedAttempts,
      count: formattedAttempts.length,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      }
    });

  } catch (error) {
    console.error('Error fetching exam history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
