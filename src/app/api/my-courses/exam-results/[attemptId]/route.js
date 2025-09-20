import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - ดึงผลการทำข้อสอบรายการ
export async function GET(request, { params }) {
  try {
    const { attemptId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ User ID' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลการทำข้อสอบ
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId: userId, // ต้องเป็นของผู้ใช้คนนี้
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionImage: true,
                questionType: true,
                marks: true,
                explanation: true,
                options: {
                  select: {
                    id: true,
                    optionText: true,
                    isCorrect: true,
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบประวัติการทำข้อสอบ' },
        { status: 404 }
      );
    }

    // จัดรูปแบบข้อมูล และเรียง answers ตาม question.order
    const formattedData = {
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
      answers: attempt.answers
        .slice() // copy array
        .sort((a, b) => {
          // If question.order exists, sort by it, otherwise by createdAt or id
          const orderA = a.question.order ?? 0;
          const orderB = b.question.order ?? 0;
          return orderA - orderB;
        })
        .map(answer => {
          const question = answer.question;
          let selectedOption = null;
          if (answer.optionId) {
            selectedOption = question.options.find(opt => opt.id === answer.optionId);
          }
          return {
            questionId: question.id,
            questionText: question.questionText,
            questionImage: question.questionImage,
            questionType: question.questionType,
            marks: question.marks,
            explanation: question.explanation,
            options: question.options,
            studentAnswer: {
              optionId: answer.optionId,
              textAnswer: answer.textAnswer,
              selectedOption: selectedOption,
              isCorrect: answer.isCorrect,
              obtainedMarks: answer.marks,
            }
          };
        })
    };

    return NextResponse.json({
      success: true,
      result: formattedData
    });

  } catch (error) {
    console.error('Error fetching exam result:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
