import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - รายการข้อสอบ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const examType = searchParams.get("examType") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (!courseId) {
      return NextResponse.json({
        success: false,
        error: "Course ID is required",
      }, { status: 400 });
    }

    // สร้าง where clause
    const where = {
      courseId: courseId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(examType && { examType }),
      ...(status === "active" && { isActive: true }),
      ...(status === "inactive" && { isActive: false }),
    };

    // สร้าง orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // นับจำนวนทั้งหมด
    const totalCount = await prisma.exam.count({ where });

    // ดึงข้อมูลข้อสอบ
    const exams = await prisma.exam.findMany({
      where,
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
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
      data: exams,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching course exams:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบ",
    }, { status: 500 });
  }
}

// POST - สร้างข้อสอบใหม่
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      title,
      description,
      courseId,
      examType,
      timeLimit,
      totalMarks,
      passingMarks,
      attemptsAllowed,
      showResults,
      showAnswers,
      isActive,
    } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !courseId || !examType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อข้อสอบ, คอร์ส, ประเภทข้อสอบ)",
      }, { status: 400 });
    }

    // ตรวจสอบว่า courseId มีอยู่จริง
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!courseExists) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคอร์สที่ระบุ",
      }, { status: 404 });
    }

    // ตรวจสอบว่าคะแนนผ่านไม่เกินคะแนนรวม
    if (passingMarks > totalMarks) {
      return NextResponse.json({
        success: false,
        error: "คะแนนผ่านต้องไม่เกินคะแนนรวม",
      }, { status: 400 });
    }

    // สร้างข้อสอบใหม่
    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        courseId,
        examType,
        timeLimit: timeLimit || null,
        totalMarks: totalMarks || 0,
        passingMarks: passingMarks || 0,
        attemptsAllowed: attemptsAllowed || 1,
        showResults: showResults ?? true,
        showAnswers: showAnswers ?? false,
        isActive: isActive ?? true,
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
      data: exam,
      message: "สร้างข้อสอบสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างข้อสอบ",
    }, { status: 500 });
  }
}
