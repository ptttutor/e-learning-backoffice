import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - สร้างคำสั่งซื้อ ebook (รอการชำระเงิน)
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ebookId, paymentMethod = "bank_transfer" } = body;

    // Validate required fields
    if (!userId || !ebookId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ userId และ ebookId" },
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

    // Get ebook
    const ebook = await prisma.ebook.findUnique({
      where: { id: ebookId, isActive: true },
    });

    if (!ebook) {
      return NextResponse.json(
        { success: false, error: "ไม่พบหนังสือ" },
        { status: 404 }
      );
    }

    // Check if user already purchased this ebook
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        ebookId: ebookId,
        status: "COMPLETED",
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: "คุณได้ซื้อหนังสือเล่มนี้แล้ว" },
        { status: 400 }
      );
    }

    // Calculate shipping fee for physical books
    const shippingFee = ebook.isPhysical ? 50 : 0; // 50 บาทสำหรับหนังสือกายภาพ
    const total = (ebook.discountPrice || ebook.price || 0) + shippingFee;

    // Create order (pending payment)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ebookId: ebook.id,
        orderType: "EBOOK",
        status: "PENDING", // รอการชำระเงิน
        total: total,
        shippingFee: shippingFee,
      },
    });

    // Create payment record (pending)
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: "PENDING", // รอการชำระเงิน
        ref: `ORD${Date.now()}${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
      },
    });

    // Create shipping record if it's a physical book (pending)
    if (ebook.isPhysical) {
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          recipientName: user.name || user.email,
          recipientPhone: "", // จะต้องกรอกในหน้าชำระเงิน
          address: "", // จะต้องกรอกในหน้าชำระเงิน
          district: "",
          province: "",
          postalCode: "",
          shippingMethod: "STANDARD",
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "สร้างคำสั่งซื้อสำเร็จ กรุณาชำระเงินและอัพโหลดหลักฐาน",
      data: {
        orderId: order.id,
        paymentId: payment.id,
        paymentRef: payment.ref,
        ebook: {
          id: ebook.id,
          title: ebook.title,
          price: ebook.discountPrice || ebook.price,
          isPhysical: ebook.isPhysical,
        },
        total: order.total,
        shippingFee: order.shippingFee,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Ebook purchase error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",
      },
      { status: 500 }
    );
  }
}