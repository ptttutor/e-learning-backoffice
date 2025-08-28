import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: /api/admin/payments/verify - อนุมัติการชำระเงิน
export async function POST(request) {
  try {
    const { paymentId, orderId, action } = await request.json(); // action: 'approve' | 'reject'

    if (!paymentId || !orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Find order with payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        course: true,
        ebook: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // อนุมัติการชำระเงิน
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          verifiedAt: new Date()
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED'
        }
      });

      // สร้าง enrollment สำหรับ course
      if (order.courseId) {
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: order.courseId,
            status: 'ACTIVE'
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'อนุมัติการชำระเงินสำเร็จ'
      });

    } else if (action === 'reject') {
      // ปฏิเสธการชำระเงิน
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date()
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'ปฏิเสธการชำระเงินแล้ว'
      });
    }

    return NextResponse.json(
      { success: false, error: 'การดำเนินการไม่ถูกต้อง' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน' },
      { status: 500 }
    );
  }
}