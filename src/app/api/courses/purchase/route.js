import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Handle free courses
    if (!course.price || course.price === 0) {
      // Create completed order for free course
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          courseId: course.id,
          orderType: "COURSE",
          status: "COMPLETED",
          total: 0,
          shippingFee: 0,
        },
      });

      // Create payment record for free course
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          method: "free",
          status: "COMPLETED",
          paidAt: new Date(),
          ref: `FREE${Date.now()}${Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()}`,
        },
      });

      // Create enrollment for free course
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "ลงทะเบียนคอร์สฟรีสำเร็จ",
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
    }

    // Handle paid courses - create pending order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        orderType: "COURSE",
        status: "PENDING", // Wait for payment
        total: course.price,
        shippingFee: 0,
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "bank_transfer",
        status: "PENDING",
        ref: `COURSE${Date.now()}${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "สร้างคำสั่งซื้อสำเร็จ กรุณาชำระเงินและอัพโหลดหลักฐาน",
      data: {
        orderId: order.id,
        paymentId: payment.id,
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
