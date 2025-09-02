// ไฟล์: /api/admin/courses/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/admin/courses - list all courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: true,
        category: true,
        chapters: true,
        enrollments: true,
        orders: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: /api/admin/courses - create a new course
export async function POST(req) {
  try {
    const body = await req.json();
    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price ?? 0,
        duration: body.duration,
        isFree: body.isFree ?? false,
        status: body.status ?? "DRAFT",
        instructorId: body.instructorId,
        categoryId: body.categoryId,
        coverImageUrl: body.coverImageUrl,
        coverPublicId: body.coverPublicId,
      },
    });
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
