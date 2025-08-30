import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  verifySlipWithEasySlip,
  parseSlipResult,
  validateSlipData,
} from "@/lib/easyslip";

const prisma = new PrismaClient();

// GET - Get existing slip analysis
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const orderId = searchParams.get("orderId");

    console.log("GET request - paymentId:", paymentId, "orderId:", orderId);

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ paymentId หรือ orderId" },
        { status: 400 }
      );
    }

    // Find payment
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true,
        },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId: orderId },
        include: {
          order: true,
        },
      });
    }

    console.log("Payment found:", !!payment);
    if (payment) {
      console.log("Payment ID:", payment.id);
      console.log("Has slipUrl:", !!payment.slipUrl);
      console.log("Has notes:", !!payment.notes);
      console.log("Notes length:", payment.notes?.length || 0);
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการชำระเงิน" },
        { status: 404 }
      );
    }

    if (!payment.slipUrl) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสลิปการโอนเงิน" },
        { status: 404 }
      );
    }

    // Parse existing analysis from slipAnalysisData field (new) or fallback to notes field (old)
    let slipAnalysis = null;
    console.log("Checking payment analysis data...");

    // Try new slipAnalysisData field first
    if (payment.slipAnalysisData) {
      try {
        slipAnalysis = JSON.parse(payment.slipAnalysisData);
        console.log("Parsed slipAnalysisData successfully");
      } catch (parseError) {
        console.error("Error parsing slipAnalysisData:", parseError);
      }
    }

    // Fallback to old notes field if no analysis data found
    if (!slipAnalysis && payment.notes) {
      try {
        const notesData = JSON.parse(payment.notes);
        // Check if it's actually analysis data (has expected structure)
        if (notesData.cloudinaryUrl || notesData.easySlipResult) {
          slipAnalysis = notesData;
          console.log("Found valid analysis data in notes field (legacy)");
        }
      } catch (parseError) {
        console.log("Notes field contains regular text, not analysis data");
      }
    }

    // If no analysis data but we have structured fields, create analysis object
    if (!slipAnalysis && (payment.detectedAmount || payment.lastAnalyzedAt)) {
      console.log("Creating analysis from structured fields");
      slipAnalysis = {
        cloudinaryUrl: payment.slipUrl,
        detectedAmount: payment.detectedAmount,
        detectedDate: payment.detectedDate,
        detectedTime: payment.detectedTime,
        senderAccount: payment.senderAccount,
        senderName: payment.senderName,
        senderBank: payment.senderBank,
        receiverAccount: payment.receiverAccount,
        receiverName: payment.receiverName,
        receiverBank: payment.receiverBank,
        transactionRef: payment.transactionRef,
        confidenceScore: payment.confidenceScore,
        validationPassed: payment.validationPassed,
        validationScore: payment.validationScore,
        analysisError: payment.analysisError,
        lastAnalyzedAt: payment.lastAnalyzedAt,
      };
    }

    // If we have existing analysis, return it
    if (slipAnalysis) {
      console.log("Returning existing analysis data");

      // Create summary from existing data
      const summary = {
        canReadSlip: slipAnalysis.easySlipResult?.success || false,
        detectedAmount: slipAnalysis.easySlipResult?.data?.amount || null,
        detectedDate: slipAnalysis.easySlipResult?.data?.date || null,
        amountMatches: slipAnalysis.validation?.success || false,
        validationScore: slipAnalysis.validation?.summary
          ? `${slipAnalysis.validation.summary.passed}/${slipAnalysis.validation.summary.totalChecks}`
          : null,
      };

      return NextResponse.json({
        success: true,
        data: {
          paymentId: payment.id,
          orderId: payment.order.id,
          slipUrl: payment.slipUrl,
          hasAnalysis: true,
          analysis: slipAnalysis,
          summary: summary,
        },
      });
    }

    // No existing analysis found
    console.log("No analysis data found in notes");
    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        slipUrl: payment.slipUrl,
        hasAnalysis: false,
        analysis: null,
        summary: null,
      },
    });
  } catch (error) {
    console.error("Error getting slip analysis:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลการวิเคราะห์สลิป" },
      { status: 500 }
    );
  }
}

// POST - Re-analyze slip with EasySlip
export async function POST(request) {
  try {
    const { paymentId, orderId } = await request.json();

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ paymentId หรือ orderId" },
        { status: 400 }
      );
    }

    // Find payment
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true,
        },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId: orderId },
        include: {
          order: true,
        },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการชำระเงิน" },
        { status: 404 }
      );
    }

    if (!payment.slipUrl) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสลิปการโอนเงิน" },
        { status: 404 }
      );
    }

    console.log("Re-analyzing slip for payment:", payment.id);

    // Verify slip with EasySlip
    let slipVerification = null;
    let slipValidation = null;

    try {
      console.log("Starting EasySlip verification...");
      const easySlipResult = await verifySlipWithEasySlip(payment.slipUrl);
      slipVerification = parseSlipResult(easySlipResult);

      if (slipVerification.success) {
        console.log("EasySlip verification successful");
        // Validate against order data
        slipValidation = validateSlipData(slipVerification.data, {
          total: payment.order.total,
          createdAt: payment.order.createdAt,
          bankAccount: "123-4-56789-0", // Your bank account number
        });
      }
    } catch (easySlipError) {
      console.error("EasySlip verification error:", easySlipError);
      slipVerification = {
        success: false,
        error: "ไม่สามารถตรวจสอบสลิปอัตโนมัติได้: " + easySlipError.message,
        data: null,
      };
    }

    // Update payment with new analysis
    const analysisData = {
      cloudinaryUrl: payment.slipUrl,
      cloudinaryPublicId: payment.slipUrl.split("/").pop().split(".")[0],
      fileSize: null, // We don't have this info for re-analysis
      fileType: "image/jpeg", // Assume JPEG
      originalName: "slip-reanalysis.jpg",
      easySlipResult: slipVerification,
      validation: slipValidation,
      uploadedAt: new Date(),
      reanalyzedAt: new Date(),
    };

    // Update payment record with new analysis using structured fields
    const updateData = {
      slipAnalysisData: JSON.stringify(analysisData),
      lastAnalyzedAt: new Date(),
    };

    // Add detected data if available
    if (slipVerification?.success && slipVerification.data) {
      const data = slipVerification.data;
      updateData.detectedAmount = data.amount ? parseFloat(data.amount) : null;
      updateData.detectedDate = data.date ? new Date(data.date) : null;
      updateData.detectedTime = data.time || null;
      updateData.senderAccount = data.senderAccount || null;
      updateData.senderName = data.senderName || null;
      updateData.senderBank = data.senderBank || null;
      updateData.receiverAccount = data.receiverAccount || null;
      updateData.receiverName = data.receiverName || null;
      updateData.receiverBank = data.receiverBank || null;
      updateData.transactionRef = data.transactionId || data.ref1 || null;
      updateData.confidenceScore = data.confidence
        ? parseFloat(data.confidence)
        : null;
      updateData.validationPassed = slipValidation?.success || false;
      updateData.validationScore = slipValidation?.summary
        ? `${slipValidation.summary.passed}/${slipValidation.summary.totalChecks}`
        : null;
      updateData.analysisError = null; // Clear any previous errors
    } else {
      updateData.analysisError =
        slipVerification?.error || "ไม่สามารถวิเคราะห์สลิปได้";
      updateData.validationPassed = false;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    // Create summary
    const summary = {
      canReadSlip: slipVerification?.success || false,
      detectedAmount: slipVerification?.data?.amount || null,
      detectedDate: slipVerification?.data?.date || null,
      amountMatches: slipValidation?.success || false,
      validationScore: slipValidation?.summary
        ? `${slipValidation.summary.passed}/${slipValidation.summary.totalChecks}`
        : null,
    };

    return NextResponse.json({
      success: true,
      message: "วิเคราะห์สลิปใหม่เสร็จสิ้น",
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        slipUrl: payment.slipUrl,
        hasAnalysis: true,
        analysis: analysisData,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error re-analyzing slip:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการวิเคราะห์สลิปใหม่" },
      { status: 500 }
    );
  }
}
