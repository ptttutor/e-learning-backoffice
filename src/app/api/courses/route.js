import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/courses - get published courses for public
export async function GET() {
  try {
    // Read query params for pagination and filter
    const { searchParams } = new URL(globalThis?.location?.href || "http://localhost");
    // fallback for edge runtime
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;
    const isRecommended = searchParams.get("isRecommended");

    // Build where condition
    const where = { status: "PUBLISHED" };
    if (isRecommended === "true") {
      where.isRecommended = true;
    } else if (isRecommended === "false") {
      where.isRecommended = false;
    }

    // Get total count
    const total = await prisma.course.count({ where });

    // Get paged courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        discountPrice: true,
        sampleVideo: true,
        duration: true,
        isFree: true,
        isRecommended: true,
        status: true,
        instructor: true,
        category: true,
        coverImageUrl: true,
        coverPublicId: true,
        isPhysical: true,
        weight: true,
        dimensions: true,
        _count: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส" },
      { status: 500 }
    );
  }
}