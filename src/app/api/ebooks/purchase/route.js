import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - ซื้อ ebook โดยตรง
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ebookId } = body;

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

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ebookId: ebook.id,
        orderType: "EBOOK",
        status: "COMPLETED", // For direct purchase, mark as completed
        total: ebook.discountPrice || ebook.price || 0,
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

    // Create shipping record if it's a physical book
    if (ebook.isPhysical) {
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          recipientName: user.name || user.email,
          recipientPhone: "", // Will need to be filled later
          address: "", // Will need to be filled later
          district: "",
          province: "",
          postalCode: "",
          shippingMethod: "PENDING",
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "ซื้อหนังสือสำเร็จ",
      data: {
        orderId: order.id,
        ebook: {
          id: ebook.id,
          title: ebook.title,
          price: ebook.discountPrice || ebook.price,
          isPhysical: ebook.isPhysical,
        },
      },
    });
  } catch (error) {
    console.error("Ebook purchase error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการซื้อหนังสือ",
      },
      { status: 500 }
    );
  }
}