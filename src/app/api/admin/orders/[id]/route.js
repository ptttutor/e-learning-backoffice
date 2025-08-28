import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล order ตาม ID สำหรับ admin
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        ebook: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
            price: true,
            discountPrice: true,
            isbn: true,
            format: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            duration: true,
            instructor: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        payment: true,
        shipping: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}

// PATCH - อัพเดทสถานะ order และ payment
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, paymentStatus, orderStatus, trackingNumber, notes } = body;

    // Find the order first
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payment: true,
        user: true,
        ebook: true,
        course: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    // Update payment status
    if (paymentStatus && order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: paymentStatus,
          paidAt: paymentStatus === 'COMPLETED' ? new Date() : order.payment.paidAt
        }
      });
    }

    // Update order status
    if (orderStatus) {
      await prisma.order.update({
        where: { id },
        data: {
          status: orderStatus
        }
      });
    }

    // Handle course enrollment for confirmed payments
    if (action === 'confirm' && order.orderType === 'COURSE' && order.courseId) {
      // Check if enrollment already exists
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: order.userId,
          courseId: order.courseId
        }
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: order.courseId,
            status: 'ACTIVE'
          }
        });
      }
    }

    // Update shipping info if provided
    if (trackingNumber && order.shipping) {
      await prisma.shipping.update({
        where: { orderId: id },
        data: {
          trackingNumber,
          status: 'SHIPPED',
          shippedAt: new Date(),
          notes
        }
      });
    }

    // Get updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ebook: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        },
        payment: true,
        shipping: true
      }
    });

    return NextResponse.json({
      success: true,
      message: action === 'confirm' ? 'ยืนยันการชำระเงินสำเร็จ' : 'อัพเดทคำสั่งซื้อสำเร็จ',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ' },
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