import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - ซื้อ course โดยตรง
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    // Validate required fields
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ userId และ courseId" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId, status: "PUBLISHED" },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "ไม่พบคอร์สเรียน" },
        { status: 404 }
      );
    }

    // Check if user already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "คุณได้ลงทะเบียนคอร์สนี้แล้ว" },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        orderType: "COURSE",
        status: "COMPLETED", // For direct purchase, mark as completed
        total: course.price || 0,
        shippingFee: 0,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "direct", // Direct purchase method
        status: "COMPLETED",
        paidAt: new Date(),
        ref: `DIR${Date.now()}${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
      },
    });

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลงทะเบียนคอร์สสำเร็จ",
      data: {
        orderId: order.id,
        enrollmentId: enrollment.id,
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
        },
      },
    });
  } catch (error) {
    console.error("Course purchase error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการลงทะเบียนคอร์ส",
      },
      { status: 500 }
    );
  }
}