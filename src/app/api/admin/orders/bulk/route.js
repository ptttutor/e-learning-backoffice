import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Bulk actions for orders
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderIds, action, notes } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุรายการคำสั่งซื้อ' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุการดำเนินการ' },
        { status: 400 }
      );
    }

    // Find orders with payments
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds }
      },
      include: {
        payment: true,
        user: true,
        course: true,
        ebook: true
      }
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อที่ระบุ' },
        { status: 404 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each order
    for (const order of orders) {
      try {
        if (action === 'confirm_payment') {
          // Only process orders with PENDING_VERIFICATION status
          if (order.payment?.status !== 'PENDING_VERIFICATION') {
            results.push({
              orderId: order.id,
              success: false,
              error: 'สถานะไม่ถูกต้องสำหรับการยืนยัน'
            });
            errorCount++;
            continue;
          }

          await prisma.$transaction(async (tx) => {
            // Update payment
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
                verifiedAt: new Date(),
                verifiedBy: 'ADMIN_BULK',
                notes: notes || 'ยืนยันแบบกลุ่ม'
              }
            });

            // Update order
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'COMPLETED',
                completedAt: new Date()
              }
            });

            // Create enrollment for course
            if (order.orderType === 'COURSE' && order.courseId) {
              const existingEnrollment = await tx.enrollment.findFirst({
                where: {
                  userId: order.userId,
                  courseId: order.courseId
                }
              });

              if (!existingEnrollment) {
                await tx.enrollment.create({
                  data: {
                    userId: order.userId,
                    courseId: order.courseId,
                    status: 'ACTIVE',
                    enrolledAt: new Date()
                  }
                });
              }
            }

            // Update coupon usage
            if (order.couponId) {
              await tx.coupon.update({
                where: { id: order.couponId },
                data: {
                  usageCount: { increment: 1 }
                }
              });

              const existingUsage = await tx.couponUsage.findFirst({
                where: {
                  couponId: order.couponId,
                  userId: order.userId,
                  orderId: order.id
                }
              });

              if (!existingUsage) {
                await tx.couponUsage.create({
                  data: {
                    couponId: order.couponId,
                    userId: order.userId,
                    orderId: order.id,
                    usedAt: new Date()
                  }
                });
              }
            }
          });

          results.push({
            orderId: order.id,
            success: true,
            message: 'ยืนยันการชำระเงินสำเร็จ'
          });
          successCount++;

        } else if (action === 'reject_payment') {
          // Only process orders with PENDING_VERIFICATION status
          if (order.payment?.status !== 'PENDING_VERIFICATION') {
            results.push({
              orderId: order.id,
              success: false,
              error: 'สถานะไม่ถูกต้องสำหรับการปฏิเสธ'
            });
            errorCount++;
            continue;
          }

          await prisma.$transaction(async (tx) => {
            // Update payment
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                status: 'REJECTED',
                verifiedAt: new Date(),
                verifiedBy: 'ADMIN_BULK',
                rejectionReason: notes || 'ปฏิเสธแบบกลุ่ม',
                notes: notes || 'ปฏิเสธแบบกลุ่ม'
              }
            });

            // Update order
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: notes || 'ปฏิเสธการชำระเงิน'
              }
            });
          });

          results.push({
            orderId: order.id,
            success: true,
            message: 'ปฏิเสธการชำระเงินแล้ว'
          });
          successCount++;

        } else if (action === 'cancel_orders') {
          // Cancel orders that are not completed
          if (order.status === 'COMPLETED') {
            results.push({
              orderId: order.id,
              success: false,
              error: 'ไม่สามารถยกเลิกคำสั่งซื้อที่สำเร็จแล้ว'
            });
            errorCount++;
            continue;
          }

          await prisma.$transaction(async (tx) => {
            // Update order
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: notes || 'ยกเลิกโดย Admin'
              }
            });

            // Update payment if exists
            if (order.payment) {
              await tx.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: 'CANCELLED'
                }
              });
            }
          });

          results.push({
            orderId: order.id,
            success: true,
            message: 'ยกเลิกคำสั่งซื้อแล้ว'
          });
          successCount++;

        } else {
          results.push({
            orderId: order.id,
            success: false,
            error: 'การดำเนินการไม่ถูกต้อง'
          });
          errorCount++;
        }

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
        results.push({
          orderId: order.id,
          success: false,
          error: 'เกิดข้อผิดพลาดในการประมวลผล'
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `ดำเนินการเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`,
      data: {
        total: orders.length,
        success: successCount,
        error: errorCount,
        results
      }
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  }
}