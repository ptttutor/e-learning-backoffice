import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT - แก้ไขข้อสอบ
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const {
      title,
      description,
      examType,
      timeLimit,
      totalMarks,
      passingMarks,
      attemptsAllowed,
      showResults,
      showAnswers,
      isActive,
    } = data;

    // ตรวจสอบว่าข้อสอบมีอยู่จริง
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบที่ระบุ",
      }, { status: 404 });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !examType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อข้อสอบ, ประเภทข้อสอบ)",
      }, { status: 400 });
    }

    // ตรวจสอบว่าคะแนนผ่านไม่เกินคะแนนรวม
    if (passingMarks > totalMarks) {
      return NextResponse.json({
        success: false,
        error: "คะแนนผ่านต้องไม่เกินคะแนนรวม",
      }, { status: 400 });
    }

    // อัพเดทข้อสอบ
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        description,
        examType,
        timeLimit: timeLimit || null,
        totalMarks: totalMarks || 0,
        passingMarks: passingMarks || 0,
        attemptsAllowed: attemptsAllowed || 1,
        showResults: showResults ?? true,
        showAnswers: showAnswers ?? false,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedExam,
      message: "แก้ไขข้อสอบสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขข้อสอบ",
    }, { status: 500 });
  }
}

// DELETE - ลบข้อสอบ
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // ตรวจสอบว่าข้อสอบมีอยู่จริง
    const existingExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    if (!existingExam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบที่ระบุ",
      }, { status: 404 });
    }

    // ตรวจสอบว่ามีการทำข้อสอบแล้วหรือไม่
    if (existingExam._count.attempts > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบข้อสอบที่มีนักเรียนทำแล้วได้",
      }, { status: 400 });
    }

    // ลบข้อสอบ (จะลบคำถามและตัวเลือกด้วยเนื่องจาก onDelete: Cascade)
    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบข้อสอบสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบข้อสอบ",
    }, { status: 500 });
  }
}

// GET - ดึงข้อมูลข้อสอบเดี่ยว
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          include: {
            options: true,
            _count: {
              select: {
                answers: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบที่ระบุ",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบ",
    }, { status: 500 });
  }
}
