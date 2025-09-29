import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/courses - get published courses for public
export async function GET(request) {
  try {
    // Read query params for pagination and filter

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;
    const isRecommended = searchParams.get("isRecommended");
    const categoryId = searchParams.get("categoryId");
    const subject = searchParams.get("subject");

    // Build where condition
    let where = { status: "PUBLISHED" };
    if (isRecommended === "true") {
      where = { ...where, isRecommended: true };
    } else if (isRecommended === "false") {
      where = { ...where, isRecommended: false };
    }
    if (categoryId) {
      where = { ...where, categoryId };
    }
    if (subject) {
      where = { ...where, subject };
    }

    // Get total count
    const total = await prisma.course.count({ where });

    // Get paged courses
    const courses = await prisma.course.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        discountPrice: true,
        sampleVideo: true,
  duration: true,
  accessDuration: true,
  accessHours: true,
        isFree: true,
        isRecommended: true,
        status: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        coverImageUrl: true,
        coverPublicId: true,
        isPhysical: true,
        weight: true,
        dimensions: true,
        _count: {
          select: {
            enrollments: true,
            chapters: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส" },
      { status: 500 }
    );
  }
}
