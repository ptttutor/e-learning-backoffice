// ไฟล์: /api/admin/courses/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/admin/courses - list courses with server-side filtering and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const skip = (page - 1) * pageSize;
    
    // Filter parameters
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const subject = searchParams.get("subject") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where = {};

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        where.status = { not: "DELETED" };
      } else {
        where.status = status;
      }
    }

    // Instructor filter
    if (instructorId) {
      where.instructorId = instructorId;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Subject filter
    if (subject) {
      where.subject = subject;
    }

    // Price range filter
    if (minPrice !== null || maxPrice !== null) {
      where.price = {};
      if (minPrice !== null) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== null) where.price.lte = parseFloat(maxPrice);
    }

    // Build orderBy clause
    const orderBy = {};
    if (sortBy === "instructor") {
      orderBy.instructor = { name: sortOrder };
    } else if (sortBy === "category") {
      orderBy.category = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count for pagination
    const totalCount = await prisma.course.count({ where });

    // Get courses with filters and pagination
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: true,
        category: true,
        chapters: true,
        enrollments: true,
        orders: true,
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        status,
        instructorId,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
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
        discountPrice: body.discountPrice,
        sampleVideo: body.sampleVideo,
        duration: body.duration,
        accessDuration: body.accessDuration,
        accessHours: body.accessHours,
        isFree: body.isFree ?? false,
        isRecommended: body.isRecommended ?? false,
        status: body.status ?? "DRAFT",
        instructorId: body.instructorId,
        categoryId: body.categoryId,
        subject: body.subject,
        coverImageUrl: body.coverImageUrl,
        coverPublicId: body.coverPublicId,
        isPhysical: body.isPhysical ?? false,
        weight: body.weight,
        dimensions: body.dimensions,
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
