import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("slip");
    const orderId = formData.get("orderId");

    if (!file || !orderId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุไฟล์และหมายเลขคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "ขนาดไฟล์ต้องไม่เกิน 5MB" },
        { status: 400 }
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        course: true,
        ebook: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "คำสั่งซื้อนี้ไม่สามารถอัพโหลดหลักฐานได้" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "payment-slips"
    );

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `slip_${orderId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/payment-slips/${fileName}`;

    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (fileError) {
      console.error("File upload error:", fileError);
      return NextResponse.json(
        { success: false, error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
        { status: 500 }
      );
    }

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        slipUrl: publicPath,
        status: "PENDING_VERIFICATION",
        uploadedAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PENDING_VERIFICATION",
      },
    });

    return NextResponse.json({
      success: true,
      message: "อัพโหลดหลักฐานการชำระเงินสำเร็จ กำลังรอการตรวจสอบ",
      data: {
        orderId: order.id,
        paymentId: updatedPayment.id,
        slipUrl: publicPath,
        status: "PENDING_VERIFICATION",
      },
    });
  } catch (error) {
    console.error("Upload slip error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "เกิดข้อผิดพลาดในการอัพโหลดหลักฐาน",
      },
      { status: 500 }
    );
  }
}