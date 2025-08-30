import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifySlipWithEasySlip, parseSlipResult, validateSlipData } from "@/lib/easyslip";

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

    // Validate file size (max 10MB for better quality)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "ขนาดไฟล์ต้องไม่เกิน 10MB" },
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

    console.log('Starting slip upload process for order:', orderId);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      const publicId = `slip_${orderId}_${Date.now()}`;
      cloudinaryResult = await uploadToCloudinary(buffer, 'payment-slips', publicId);
      console.log('Cloudinary upload successful:', cloudinaryResult.public_id);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      console.error("Error details:", cloudinaryError.message);
      console.error("Error stack:", cloudinaryError.stack);
      return NextResponse.json(
        { success: false, error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์: " + cloudinaryError.message },
        { status: 500 }
      );
    }

    // Verify slip with EasySlip (optional - don't fail if it doesn't work)
    let slipVerification = null;
    let slipValidation = null;
    
    try {
      console.log('Starting EasySlip verification...');
      const easySlipResult = await verifySlipWithEasySlip(cloudinaryResult.secure_url);
      slipVerification = parseSlipResult(easySlipResult);
      
      if (slipVerification.success) {
        console.log('EasySlip verification successful');
        // Validate against order data
        slipValidation = validateSlipData(slipVerification.data, {
          total: order.total,
          createdAt: order.createdAt,
          bankAccount: '123-4-56789-0' // Your bank account number
        });
      }
    } catch (easySlipError) {
      console.error("EasySlip verification error:", easySlipError);
      // Continue without EasySlip verification
      slipVerification = {
        success: false,
        error: 'ไม่สามารถตรวจสอบสลิปอัตโนมัติได้',
        data: null
      };
    }

    // Prepare slip analysis data
    const slipAnalysis = {
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      fileSize: file.size,
      fileType: file.type,
      originalName: file.name,
      easySlipResult: slipVerification,
      validation: slipValidation,
      uploadedAt: new Date()
    };

    // Update payment record
    console.log('Updating payment with analysis data...');
    console.log('Analysis data:', JSON.stringify(slipAnalysis, null, 2));
    
    const updatedPayment = await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        slipUrl: cloudinaryResult.secure_url,
        status: "PENDING_VERIFICATION",
        uploadedAt: new Date(),
        notes: JSON.stringify(slipAnalysis), // Store analysis data in notes field
      },
    });
    
    console.log('Payment updated successfully. Notes length:', updatedPayment.notes?.length);

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PENDING_VERIFICATION",
      },
    });

    // Prepare response
    const responseData = {
      orderId: order.id,
      paymentId: updatedPayment.id,
      slipUrl: cloudinaryResult.secure_url,
      status: "PENDING_VERIFICATION",
      slipAnalysis: {
        easySlipSuccess: slipVerification?.success || false,
        validationSummary: slipValidation?.summary || null,
        detectedAmount: slipVerification?.data?.amount || null,
        detectedDate: slipVerification?.data?.date || null,
      }
    };

    return NextResponse.json({
      success: true,
      message: "อัพโหลดหลักฐานการชำระเงินสำเร็จ กำลังรอการตรวจสอบ",
      data: responseData,
    });

  } catch (error) {
    console.error("Upload slip error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "เกิดข้อผิดพลาดในการอัพโหลดหลักฐาน",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}