import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT - แก้ไขคำถาม
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const {
      questionText,
      questionImage,
      questionType,
      marks,
      explanation,
      options,
    } = data;

    // ตรวจสอบว่าคำถามมีอยู่จริง
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!questionText || !questionType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (คำถาม, ประเภทคำถาม)",
      }, { status: 400 });
    }

    // ตรวจสอบตัวเลือกสำหรับ Multiple Choice และ True/False
    if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
      if (!options || options.length < 2) {
        return NextResponse.json({
          success: false,
          error: "กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก",
        }, { status: 400 });
      }

      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        return NextResponse.json({
          success: false,
          error: "กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก",
        }, { status: 400 });
      }
    }

    // ตรวจสอบว่ามีการตอบแล้วหรือไม่ (ถ้ามีอาจจะจำกัดการแก้ไข)
    if (existingQuestion._count.answers > 0) {
      // อาจจะให้เตือนผู้ใช้ว่ามีการตอบแล้ว แต่ยังให้แก้ไขได้
      console.log(`Warning: Question ${id} has ${existingQuestion._count.answers} answers`);
    }

    // อัพเดทคำถาม
    const updatedQuestion = await prisma.$transaction(async (prisma) => {
      // ลบตัวเลือกเก่าทั้งหมด
      await prisma.questionOption.deleteMany({
        where: { questionId: id },
      });

      // อัพเดทคำถาม
      const question = await prisma.question.update({
        where: { id },
        data: {
          questionText,
          questionImage: questionImage || null,
          questionType,
          marks: marks || 1,
          explanation: explanation || null,
          updatedAt: new Date(),
        },
      });

      // เพิ่มตัวเลือกใหม่ (ถ้ามี)
      if (options && options.length > 0) {
        await prisma.questionOption.createMany({
          data: options.map((opt) => ({
            questionId: id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: opt.order,
          })),
        });
      }

      return question;
    });

    // ดึงข้อมูลคำถามที่อัพเดทแล้วพร้อมตัวเลือก
    const questionWithOptions = await prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: questionWithOptions,
      message: "แก้ไขคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขคำถาม",
    }, { status: 500 });
  }
}

// DELETE - ลบคำถาม
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // ตรวจสอบว่าคำถามมีอยู่จริง
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    // ตรวจสอบว่ามีการตอบแล้วหรือไม่
    if (existingQuestion._count.answers > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบคำถามที่มีนักเรียนตอบแล้วได้",
      }, { status: 400 });
    }

    // ลบคำถาม (จะลบตัวเลือกด้วยเนื่องจาก onDelete: Cascade)
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบคำถาม",
    }, { status: 500 });
  }
}

// GET - ดึงข้อมูลคำถามเดี่ยว
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        options: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม",
    }, { status: 500 });
  }
}
