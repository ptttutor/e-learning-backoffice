import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary-utils";
import { verifySlipWithEasySlip, calculateSlipConfidence } from "@/lib/easyslip";

// POST - อัปโหลด slip และตรวจสอบอัตโนมัติ
export async function POST(request) {
  try {
    console.log('🚀 Starting payment slip upload process...');

    const formData = await request.formData();
    const file = formData.get("file");
    const orderId = formData.get("orderId");
    const paymentMethod = formData.get("paymentMethod") || "BANK_TRANSFER";

    console.log('📋 Request data:', { 
      hasFile: !!file, 
      orderId, 
      paymentMethod,
      fileType: file?.type,
      fileSize: file?.size 
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์ slip" },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ orderId" },
        { status: 400 }
      );
    }

    // ตรวจสอบไฟล์
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "ไฟล์ต้องมีขนาดไม่เกิน 10MB" },
        { status: 400 }
      );
    }

    // ตรวจสอบ order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        course: true,
        payment: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูล order" },
        { status: 404 }
      );
    }

    console.log('📦 Order found:', order.id, order.orderNumber, order.total);

    // อัปโหลดไฟล์ไปยัง Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(file, 'payment-slips');

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถอัปโหลดไฟล์ได้", details: uploadResult.error },
        { status: 500 }
      );
    }

    console.log('✅ Upload successful:', uploadResult.data.url);

    // ตรวจสอบ slip ด้วย EasySlip API
    let verificationResult = null;
    let confidenceCalculation = null;
    let shouldAutoApprove = false;

    try {
      console.log('🔍 Verifying slip with EasySlip...');
      // ส่งไฟล์โดยตรงแทนการส่ง URL
      verificationResult = await verifySlipWithEasySlip(file);
      console.log('📊 EasySlip result:', verificationResult);

      // คำนวณ confidence score
      confidenceCalculation = calculateSlipConfidence(verificationResult, order);
      shouldAutoApprove = confidenceCalculation.shouldAutoApprove;

      console.log('📊 Confidence calculation:', confidenceCalculation);
      if (shouldAutoApprove) {
        console.log('🎯 Auto-approval triggered!');
      }
    } catch (verifyError) {
      console.error('❌ EasySlip verification failed:', verifyError);
      verificationResult = { 
        success: false, 
        error: verifyError.message,
        provider: 'easyslip'
      };
      confidenceCalculation = {
        score: 0,
        shouldAutoApprove: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบ"
      };
    }

    // สร้าง payment data สำหรับ create
    const createPaymentData = {
      orderId,
      method: paymentMethod,
      status: shouldAutoApprove ? 'COMPLETED' : 'PENDING_VERIFICATION',
      amount: order.total,
      slipUrl: uploadResult.data.url,
      uploadedAt: new Date(),
      verifiedAt: shouldAutoApprove ? new Date() : null,
      slipAnalysisData: verificationResult ? JSON.stringify(verificationResult) : null,
      confidenceScore: confidenceCalculation?.score || 0,
      validationPassed: shouldAutoApprove,
      lastAnalyzedAt: new Date(),
      notes: confidenceCalculation?.message || `ตรวจสอบด้วยตนเอง - Confidence: 0%`,
      // เพิ่ม error หาก EasySlip ล้มเหลว
      ...(verificationResult && !verificationResult.success && {
        analysisError: verificationResult.error
      }),
      // เพิ่มข้อมูลจาก EasySlip verification
      ...(verificationResult?.success && verificationResult?.data && {
        detectedAmount: verificationResult.data.amount,
        detectedDate: verificationResult.data.transDate ? new Date(verificationResult.data.transDate) : null,
        detectedTime: verificationResult.data.transTime,
        senderAccount: verificationResult.data.sender?.account,
        senderName: verificationResult.data.sender?.name,
        senderBank: verificationResult.data.sender?.bank,
        receiverAccount: verificationResult.data.receiver?.account,
        receiverName: verificationResult.data.receiver?.name,
        receiverBank: verificationResult.data.receiver?.bank,
        transactionRef: verificationResult.data.ref
      })
    };

    // สร้าง payment data สำหรับ update (ไม่รวม orderId)
    const updatePaymentData = { ...createPaymentData };
    delete updatePaymentData.orderId;

    // ตรวจสอบว่ามี payment สำหรับ order นี้แล้วหรือยัง
    const existingPayment = order.payment && 
      order.payment.status !== 'REJECTED' && 
      order.payment.status !== 'FAILED' ? order.payment : null;
    
    let payment;
    if (existingPayment) {
      // อัปเดต payment ที่มีอยู่ (ไม่รวม orderId)
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: updatePaymentData,
        include: {
          order: {
            include: {
              user: true,
              course: true
            }
          }
        }
      });
      console.log('📝 Updated existing payment:', payment.id);
    } else {
      // สร้าง payment ใหม่
      payment = await prisma.payment.create({
        data: createPaymentData,
        include: {
          order: {
            include: {
              user: true,
              course: true
            }
          }
        }
      });
      console.log('📝 Created new payment:', payment.id);
    }

    // ถ้าอนุมัติอัตโนมัติ ให้สร้าง enrollment
    if (shouldAutoApprove && order.courseId) {
      try {
        console.log('🎓 Creating enrollment...');
        
        // ตรวจสอบว่ามี enrollment แล้วหรือยัง
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            userId: order.userId,
            courseId: order.courseId
          }
        });

        if (!existingEnrollment) {
          const enrollment = await prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: order.courseId,
              enrolledAt: new Date(),
              status: 'ACTIVE'
            }
          });
          console.log('✅ Enrollment created:', enrollment.id);
        } else {
          console.log('ℹ️ Enrollment already exists');
        }

        // อัปเดต order status
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'COMPLETED',
            updatedAt: new Date()
          }
        });
        console.log('✅ Order marked as completed');

        // อัปเดต payment status เป็น COMPLETED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            verifiedAt: new Date(),
            paidAt: new Date()
          }
        });
        console.log('✅ Payment marked as completed');

      } catch (enrollError) {
        console.error('❌ Failed to create enrollment:', enrollError);
      }
    }

    console.log('🎉 Payment slip upload completed successfully!');

    return NextResponse.json({
      success: true,
      data: {
        payment,
        verification: verificationResult,
        confidence: confidenceCalculation?.score || 0,
        confidenceDetails: confidenceCalculation?.details,
        autoApproved: shouldAutoApprove,
        upload: {
          url: uploadResult.data.url,
          publicId: uploadResult.data.publicId
        },
        message: confidenceCalculation?.message || `อัปโหลด slip สำเร็จ กำลังรอการตรวจสอบ (0% confidence)`
      }
    });

  } catch (error) {
    console.error("❌ Error uploading payment slip:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปโหลด slip", details: error.message },
      { status: 500 }
    );
  }
}

// GET - ดูข้อมูล payment slip
export async function GET(request) {
  try {
    console.log('🔍 Getting payment slip data...');

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ orderId หรือ paymentId" },
        { status: 400 }
      );
    }

    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
              course: true,
            }
          }
        }
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        include: {
          order: {
            include: {
              user: true,
              course: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการชำระเงิน" },
        { status: 404 }
      );
    }

    console.log('✅ Payment found:', payment.id, payment.status);

    return NextResponse.json({
      success: true,
      data: {
        payment,
        order: payment.order
      }
    });

  } catch (error) {
    console.error("❌ Error fetching payment slip:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}