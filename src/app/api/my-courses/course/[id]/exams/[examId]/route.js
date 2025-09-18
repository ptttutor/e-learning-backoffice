import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - เริ่มทำข้อสอบ (ดึงโจทย์)
export async function GET(request, { params }) {
  try {
    const { id: courseId, examId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ User ID' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อสอบมีอยู่และเปิดใช้งาน
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        courseId: courseId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อสอบ' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าผู้ใช้ลงทะเบียนคอร์สนี้หรือไม่
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: courseId,
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

    // ตรวจสอบว่าทำข้อสอบไปแล้วหรือไม่
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId,
        userId,
      }
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'COMPLETED') {
        return NextResponse.json(
          { success: false, error: 'คุณได้ทำข้อสอบนี้ไปแล้ว' },
          { status: 400 }
        );
      }

      // ถ้าทำไม่เสร็จ ให้ต่อทำ
      const questions = await prisma.question.findMany({
        where: { examId },
        include: {
          options: {
            select: {
              id: true,
              optionText: true,
              order: true,
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return NextResponse.json({
        success: true,
        data: {
          exam,
          questions: questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            questionImage: q.questionImage,
            questionType: q.questionType,
            marks: q.marks,
            options: q.options,
          })),
          attemptId: existingAttempt.id,
          startedAt: existingAttempt.startedAt,
        }
      });
    }

    // สร้างการทำข้อสอบใหม่
    const questions = await prisma.question.findMany({
      where: { examId },
      include: {
        options: {
          select: {
            id: true,
            optionText: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        userId,
        totalQuestions,
        totalMarks,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        exam,
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          questionImage: q.questionImage,
          questionType: q.questionType,
          marks: q.marks,
          options: q.options,
        })),
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
      }
    });

  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการเริ่มข้อสอบ' },
      { status: 500 }
    );
  }
}

// POST - ส่งคำตอบข้อสอบ
export async function POST(request, { params }) {
  try {
    const { id: courseId, examId } = await params;
    const body = await request.json();
    const { answers, userId } = body; // [{ questionId, optionId?, textAnswer? }]

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ User ID' },
        { status: 400 }
      );
    }

    // ตรวจสอบการทำข้อสอบ
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        examId,
        userId,
        status: 'IN_PROGRESS'
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบการทำข้อสอบ' },
        { status: 404 }
      );
    }

    // ดึงข้อมูลคำถามและคำตอบที่ถูก
    const questions = await prisma.question.findMany({
      where: { examId },
      include: {
        options: true
      }
    });

    let correctAnswers = 0;
    let obtainedMarks = 0;
    const studentAnswers = [];

    // ตรวจคำตอบแต่ละข้อ
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let marks = 0;

      if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
        if (answer.optionId) {
          const selectedOption = question.options.find(opt => opt.id === answer.optionId);
          if (selectedOption && selectedOption.isCorrect) {
            isCorrect = true;
            marks = question.marks;
            correctAnswers++;
            obtainedMarks += marks;
          }
        }

        studentAnswers.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          optionId: answer.optionId,
          isCorrect,
          marks,
        });
      } else if (question.questionType === 'SHORT_ANSWER') {
        // สำหรับคำตอบสั้น ให้คะแนนเต็มไปก่อน (ต้องให้ครูตรวจทีหลัง)
        marks = question.marks;
        obtainedMarks += marks;
        correctAnswers++; // นับไปก่อน

        studentAnswers.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          textAnswer: answer.textAnswer,
          isCorrect: true, // ให้ถูกไปก่อน
          marks,
        });
      }
    }

    // บันทึกคำตอบทั้งหมด
    await prisma.studentAnswer.createMany({
      data: studentAnswers
    });

    // คำนวณผล
    const percentage = attempt.totalMarks > 0 ? (obtainedMarks / attempt.totalMarks) * 100 : 0;
    const passed = percentage >= 60; // เกณฑ์ผ่าน 60%

    // อัปเดตผลการทำข้อสอบ
    const completedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        correctAnswers,
        obtainedMarks,
        percentage,
        passed,
      },
      include: {
        exam: {
          select: {
            title: true,
            course: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ส่งคำตอบสำเร็จ',
      result: {
        attemptId: completedAttempt.id,
        totalQuestions: completedAttempt.totalQuestions,
        correctAnswers: completedAttempt.correctAnswers,
        totalMarks: completedAttempt.totalMarks,
        obtainedMarks: completedAttempt.obtainedMarks,
        percentage: completedAttempt.percentage,
        passed: completedAttempt.passed,
        exam: completedAttempt.exam,
        completedAt: completedAttempt.completedAt,
      }
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการส่งคำตอบ' },
      { status: 500 }
    );
  }
}
