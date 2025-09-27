import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/courses/[id] - get single course for public
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const course = await prisma.course.findUnique({
      where: {
        id: id,
        status: "PUBLISHED",
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
        chapters: {
          select: {
            id: true,
            title: true,
            order: true,
            contents: {
              select: {
                id: true,
                title: true,
                contentType: true,
                order: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "ไม่พบคอร์สที่ระบุ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส" },
      { status: 500 }
    );
  }
}
