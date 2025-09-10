import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - รายการคำถาม
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const questionType = searchParams.get("questionType") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!examId) {
      return NextResponse.json({
        success: false,
        error: "Exam ID is required",
      }, { status: 400 });
    }

    // สร้าง where clause
    const where = {
      examId: examId,
      ...(search && {
        OR: [
          { questionText: { contains: search, mode: "insensitive" } },
          { explanation: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(questionType && { questionType }),
    };

    // สร้าง orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // นับจำนวนทั้งหมด
    const totalCount = await prisma.question.count({ where });

    // ดึงข้อมูลคำถาม
    const questions = await prisma.question.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม",
    }, { status: 500 });
  }
}

// POST - สร้างคำถามใหม่
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      questionText,
      questionImage,
      questionType,
      marks,
      explanation,
      examId,
      options,
    } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!questionText || !examId || !questionType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (คำถาม, ข้อสอบ, ประเภทคำถาม)",
      }, { status: 400 });
    }

    // ตรวจสอบว่า examId มีอยู่จริง
    const examExists = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบที่ระบุ",
      }, { status: 404 });
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

    // สร้างคำถามใหม่พร้อมตัวเลือก
    const question = await prisma.question.create({
      data: {
        questionText,
        questionImage: questionImage || null,
        questionType,
        marks: marks || 1,
        explanation: explanation || null,
        examId,
        ...(options && options.length > 0 && {
          options: {
            create: options.map((opt) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              order: opt.order,
            })),
          },
        }),
      },
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
      data: question,
      message: "สร้างคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างคำถาม",
    }, { status: 500 });
  }
}
