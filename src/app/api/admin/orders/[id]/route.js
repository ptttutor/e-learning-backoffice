import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล order ตาม ID สำหรับ admin
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ ID คำสั่งซื้อ' },
        { status: 400 }
      );
    }

    console.log('Fetching order with ID:', id);
    
    // First, get basic order info
    const basicOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!basicOrder) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    console.log('Basic order found:', basicOrder.id);

    // Then get related data step by step
    let order = { ...basicOrder };

    try {
      // Get user data
      if (basicOrder.userId) {
        const user = await prisma.user.findUnique({
          where: { id: basicOrder.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        order.user = user;
      }

      // Get payment data
      const payment = await prisma.payment.findFirst({
        where: { orderId: id }
      });
      order.payment = payment;

      // Get ebook data if applicable
      if (basicOrder.ebookId) {
        const ebook = await prisma.ebook.findUnique({
          where: { id: basicOrder.ebookId },
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
            price: true,
            discountPrice: true
          }
        });
        order.ebook = ebook;
      }

      // Get course data if applicable
      if (basicOrder.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: basicOrder.courseId },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            instructorId: true
          }
        });
        
        if (course && course.instructorId) {
          // Get instructor data
          try {
            const instructor = await prisma.user.findUnique({
              where: { id: course.instructorId },
              select: {
                name: true,
                email: true
              }
            });
            course.instructor = instructor;
          } catch (instructorError) {
            console.log('No instructor found or error:', instructorError.message);
            course.instructor = null;
          }
        } else if (course) {
          course.instructor = null;
        }
        
        order.course = course;
      }

      // Get shipping data
      const shipping = await prisma.shipping.findFirst({
        where: { orderId: id }
      });
      order.shipping = shipping;

      // Get coupon data if applicable
      if (basicOrder.couponId) {
        const coupon = await prisma.coupon.findUnique({
          where: { id: basicOrder.couponId },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true
          }
        });
        order.coupon = coupon;
      }

    } catch (relationError) {
      console.error('Error fetching relations:', relationError);
      // Continue with basic order data
    }

    console.log('Order data prepared successfully');

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH - อัพเดทสถานะ order และ payment
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ ID คำสั่งซื้อ' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, notes, rejectionReason } = body;

    console.log('PATCH request for order:', id, 'with action:', action);

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    // Get payment
    const payment = await prisma.payment.findFirst({
      where: { orderId: id }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลการชำระเงิน' },
        { status: 404 }
      );
    }

    console.log('Order found:', order.id, 'Payment status:', payment.status);

    // Validate current status for actions
    if (action === 'confirm' && payment.status !== 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถยืนยันการชำระเงินได้ สถานะปัจจุบัน: ${payment.status}` },
        { status: 400 }
      );
    }

    if (action === 'reject' && payment.status !== 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถปฏิเสธการชำระเงินได้ สถานะปัจจุบัน: ${payment.status}` },
        { status: 400 }
      );
    }

    let enrollment = null;

    // Handle confirm action
    if (action === 'confirm') {
      console.log('Confirming payment:', payment.id);

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          verifiedAt: new Date(),
          verifiedBy: 'ADMIN',
          notes: notes || null
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id },
        data: {
          status: 'COMPLETED'
        }
      });

      // Create enrollment for course
      if (order.orderType === 'COURSE' && order.courseId) {
        try {
          const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
              userId: order.userId,
              courseId: order.courseId
            }
          });

          if (!existingEnrollment) {
            enrollment = await prisma.enrollment.create({
              data: {
                userId: order.userId,
                courseId: order.courseId,
                status: 'ACTIVE'
              }
            });
            console.log('Enrollment created:', enrollment.id);
          }
        } catch (enrollmentError) {
          console.error('Enrollment error:', enrollmentError);
        }
      }
    }

    // Handle reject action
    if (action === 'reject') {
      console.log('Rejecting payment:', payment.id);

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date(),
          verifiedBy: 'ADMIN',
          rejectionReason: rejectionReason || 'ไม่ระบุเหตุผล',
          notes: notes || null
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    // Prepare response message
    let message = 'อัพเดทคำสั่งซื้อสำเร็จ';
    if (action === 'confirm') {
      message = 'ยืนยันการชำระเงินสำเร็จ';
      if (enrollment) {
        message += ' และลงทะเบียนคอร์สเรียนแล้ว';
      }
    } else if (action === 'reject') {
      message = 'ปฏิเสธการชำระเงินแล้ว';
    }

    return NextResponse.json({
      success: true,
      message,
      data: { orderId: id, action, status: action === 'confirm' ? 'COMPLETED' : 'CANCELLED' },
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Error updating order:', error);
    console.error('Error details:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - ยกเลิกคำสั่งซื้อ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Update order status to cancelled
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      },
      include: {
        payment: true
      }
    });

    // Update payment status if exists
    if (updatedOrder.payment) {
      await prisma.payment.update({
        where: { id: updatedOrder.payment.id },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'ยกเลิกคำสั่งซื้อสำเร็จ',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}