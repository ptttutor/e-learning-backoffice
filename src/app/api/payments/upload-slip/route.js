import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifySlipWithSlipOK, parseSlipResult, validateSlipData } from "@/lib/easyslip";

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

    console.log('Starting slip verification process for order:', orderId);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 1: Verify slip with SlipOK FIRST
    console.log('🔍 Step 1: Verifying slip with SlipOK API...');
    let slipVerification = null;
    let slipValidation = null;
    
    try {
      const slipOKResult = await verifySlipWithSlipOK(buffer, file.name, file.type);
      slipVerification = parseSlipResult(slipOKResult);
      
      if (slipVerification.success) {
        console.log('✅ SlipOK verification successful');
        
        // Validate against order data
        slipValidation = validateSlipData(slipVerification.data, {
          total: order.total,
          createdAt: order.createdAt,
          bankAccount: '123-4-56789-0' // Your bank account number
        });
        
        console.log('✅ Slip validation completed');
      } else {
        console.log('❌ SlipOK verification failed:', slipVerification.error);
        
        // Return error if slip verification fails
        return NextResponse.json({
          success: false,
          error: "ไม่สามารถตรวจสอบสลิปได้: " + slipVerification.error,
          details: {
            step: "slip_verification",
            slipOKError: slipVerification.error
          }
        }, { status: 400 });
      }
    } catch (slipOKError) {
      console.error("❌ SlipOK verification error:", slipOKError);
      return NextResponse.json({
        success: false,
        error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป: " + slipOKError.message,
        details: {
          step: "slip_verification",
          error: slipOKError.message
        }
      }, { status: 500 });
    }

    // Step 2: Upload to Cloudinary only if verification succeeds
    console.log('📤 Step 2: Uploading verified slip to Cloudinary...');
    let cloudinaryResult;
    try {
      const publicId = `slip_${orderId}_${Date.now()}`;
      cloudinaryResult = await uploadToCloudinary(buffer, 'payment-slips', publicId);
      console.log('✅ Cloudinary upload successful:', cloudinaryResult.public_id);
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary upload error:", cloudinaryError);
      return NextResponse.json(
        { 
          success: false, 
          error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์: " + cloudinaryError.message,
          details: {
            step: "cloudinary_upload",
            error: cloudinaryError.message
          }
        },
        { status: 500 }
      );
    }

    // Prepare slip analysis data
    const slipAnalysis = {
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      fileSize: file.size,
      fileType: file.type,
      originalName: file.name,
      slipOKResult: slipVerification,
      validation: slipValidation,
      uploadedAt: new Date()
    };

    // Update payment record with detailed analysis data
    console.log('Updating payment with analysis data...');
    console.log('Analysis data:', JSON.stringify(slipAnalysis, null, 2));
    
    // For now, use the notes field until Prisma client is regenerated
    const updatedPayment = await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        slipUrl: cloudinaryResult.secure_url,
        status: "PENDING_VERIFICATION",
        uploadedAt: new Date(),
        notes: JSON.stringify(slipAnalysis), // Store analysis data in notes field temporarily
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
        slipOKSuccess: slipVerification?.success || false,
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