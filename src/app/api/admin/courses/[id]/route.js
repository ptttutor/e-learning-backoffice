import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/admin/courses/[id] - get a single course
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        category: true,
        chapters: {
          include: {
            contents: true,
          },
        },
        enrollments: true,
        orders: true,
      },
    });

    if (!course)
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: /api/admin/courses/[id] - update a course
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );

    const body = await req.json();

    // ตรวจสอบว่าคอร์สมีอยู่จริงหรือไม่
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price) || 0,
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        sampleVideo: body.sampleVideo,
        duration: body.duration,
        accessDuration: body.accessDuration,
        accessHours: body.accessHours,
        isFree: body.isFree,
        isRecommended: body.isRecommended ?? false,
        status: body.status,
        instructorId: body.instructorId,
        categoryId: body.categoryId,
        subject: body.subject,
        coverImageUrl: body.coverImageUrl,
        coverPublicId: body.coverPublicId,
        isPhysical: body.isPhysical ?? false,
        weight: body.weight,
        dimensions: body.dimensions,
      },
      include: {
        instructor: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE: /api/admin/courses/[id] - delete a course
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure all deletes succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Check if course exists and get all related data
      const course = await tx.course.findUnique({
        where: { id },
        include: {
          chapters: {
            include: {
              contents: true,
            },
          },
          enrollments: true,
          orders: true,
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      // Check if course has enrollments or orders
      if (course.enrollments.length > 0) {
        throw new Error(
          `Cannot delete course with ${course.enrollments.length} existing enrollments. Please remove them first.`
        );
      }

      if (course.orders.length > 0) {
        throw new Error(
          `Cannot delete course with ${course.orders.length} existing orders. Please remove them first.`
        );
      }

      // Delete all chapter contents first
      for (const chapter of course.chapters) {
        if (chapter.contents.length > 0) {
          await tx.content.deleteMany({
            where: { chapterId: chapter.id },
          });
        }
      }

      // Delete all chapters
      if (course.chapters.length > 0) {
        await tx.chapter.deleteMany({
          where: { courseId: id },
        });
      }

      // Finally delete the course
      await tx.course.delete({ where: { id } });
      return {
        success: true,
        message: "Course and all related data deleted successfully",
        deletedCourse: {
          id: course.id,
          title: course.title,
          chaptersDeleted: course.chapters.length,
          contentsDeleted: course.chapters.reduce(
            (sum, ch) => sum + ch.contents.length,
            0
          ),
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
