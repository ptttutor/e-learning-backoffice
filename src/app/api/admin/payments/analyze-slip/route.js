import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySlipWithEasySlip, parseSlipResult, validateSlipData } from '@/lib/easyslip';

const prisma = new PrismaClient();

// GET - Get existing slip analysis
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    console.log('GET request - paymentId:', paymentId, 'orderId:', orderId);

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ paymentId หรือ orderId' },
        { status: 400 }
      );
    }

    // Find payment
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true
        }
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId: orderId },
        include: {
          order: true
        }
      });
    }

    console.log('Payment found:', !!payment);
    if (payment) {
      console.log('Payment ID:', payment.id);
      console.log('Has slipUrl:', !!payment.slipUrl);
      console.log('Has notes:', !!payment.notes);
      console.log('Notes length:', payment.notes?.length || 0);
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลการชำระเงิน' },
        { status: 404 }
      );
    }

    if (!payment.slipUrl) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบสลิปการโอนเงิน' },
        { status: 404 }
      );
    }

    // Parse existing analysis from notes field
    let slipAnalysis = null;
    console.log('Checking payment notes...');
    
    if (payment.notes) {
      try {
        // Try to parse as JSON (analysis data)
        slipAnalysis = JSON.parse(payment.notes);
        console.log('Parsed notes successfully');
        console.log('Analysis keys:', Object.keys(slipAnalysis));
        
        // Check if it's actually analysis data (has expected structure)
        if (!slipAnalysis.cloudinaryUrl && !slipAnalysis.easySlipResult) {
          console.log('Notes does not contain analysis data');
          slipAnalysis = null; // It's just regular notes, not analysis data
        } else {
          console.log('Found valid analysis data in notes');
        }
      } catch (parseError) {
        console.log('Failed to parse notes as JSON:', parseError.message);
        // It's just regular notes, not JSON analysis data
        slipAnalysis = null;
      }
    } else {
      console.log('No notes found in payment record');
    }

    // If we have existing analysis, return it
    if (slipAnalysis) {
      console.log('Returning existing analysis data');
      
      // Create summary from existing data
      const summary = {
        canReadSlip: slipAnalysis.easySlipResult?.success || false,
        detectedAmount: slipAnalysis.easySlipResult?.data?.amount || null,
        detectedDate: slipAnalysis.easySlipResult?.data?.date || null,
        amountMatches: slipAnalysis.validation?.success || false,
        validationScore: slipAnalysis.validation?.summary ? 
          `${slipAnalysis.validation.summary.passed}/${slipAnalysis.validation.summary.totalChecks}` : 
          null
      };

      return NextResponse.json({
        success: true,
        data: {
          paymentId: payment.id,
          orderId: payment.order.id,
          slipUrl: payment.slipUrl,
          hasAnalysis: true,
          analysis: slipAnalysis,
          summary: summary
        }
      });
    }

    // No existing analysis found
    console.log('No analysis data found in notes');
    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        slipUrl: payment.slipUrl,
        hasAnalysis: false,
        analysis: null,
        summary: null
      }
    });

  } catch (error) {
    console.error('Error getting slip analysis:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการวิเคราะห์สลิป' },
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
        { success: false, error: 'กรุณาระบุ paymentId หรือ orderId' },
        { status: 400 }
      );
    }

    // Find payment
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true
        }
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId: orderId },
        include: {
          order: true
        }
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลการชำระเงิน' },
        { status: 404 }
      );
    }

    if (!payment.slipUrl) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบสลิปการโอนเงิน' },
        { status: 404 }
      );
    }

    console.log('Re-analyzing slip for payment:', payment.id);

    // Verify slip with EasySlip
    let slipVerification = null;
    let slipValidation = null;
    
    try {
      console.log('Starting EasySlip verification...');
      const easySlipResult = await verifySlipWithEasySlip(payment.slipUrl);
      slipVerification = parseSlipResult(easySlipResult);
      
      if (slipVerification.success) {
        console.log('EasySlip verification successful');
        // Validate against order data
        slipValidation = validateSlipData(slipVerification.data, {
          total: payment.order.total,
          createdAt: payment.order.createdAt,
          bankAccount: '123-4-56789-0' // Your bank account number
        });
      }
    } catch (easySlipError) {
      console.error("EasySlip verification error:", easySlipError);
      slipVerification = {
        success: false,
        error: 'ไม่สามารถตรวจสอบสลิปอัตโนมัติได้: ' + easySlipError.message,
        data: null
      };
    }

    // Update payment with new analysis
    const analysisData = {
      cloudinaryUrl: payment.slipUrl,
      cloudinaryPublicId: payment.slipUrl.split('/').pop().split('.')[0],
      fileSize: null, // We don't have this info for re-analysis
      fileType: 'image/jpeg', // Assume JPEG
      originalName: 'slip-reanalysis.jpg',
      easySlipResult: slipVerification,
      validation: slipValidation,
      uploadedAt: new Date(),
      reanalyzedAt: new Date()
    };

    // Update payment record with new analysis
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        notes: JSON.stringify(analysisData)
      }
    });

    // Create summary
    const summary = {
      canReadSlip: slipVerification?.success || false,
      detectedAmount: slipVerification?.data?.amount || null,
      detectedDate: slipVerification?.data?.date || null,
      amountMatches: slipValidation?.success || false,
      validationScore: slipValidation?.summary ? 
        `${slipValidation.summary.passed}/${slipValidation.summary.totalChecks}` : 
        null
    };

    return NextResponse.json({
      success: true,
      message: 'วิเคราะห์สลิปใหม่เสร็จสิ้น',
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        slipUrl: payment.slipUrl,
        hasAnalysis: true,
        analysis: analysisData,
        summary: summary
      }
    });

  } catch (error) {
    console.error('Error re-analyzing slip:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการวิเคราะห์สลิปใหม่' },
      { status: 500 }
    );
  }
}