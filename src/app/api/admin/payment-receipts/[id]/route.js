import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/payment-receipts/[id] - อัพเดทสถานะใบเสร็จ
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const receipt = await prisma.paymentReceipt.update({
      where: { id },
      data: {
        status: body.status,
        reviewedBy: body.reviewedBy,
        reviewedAt: body.status !== 'pending' ? new Date() : null,
        reviewNotes: body.reviewNotes
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // อัพเดทสถานะ order ถ้าใบเสร็จได้รับการอนุมัติ
    if (body.status === 'approved') {
      await prisma.order.update({
        where: { id: receipt.orderId },
        data: {
          status: 'paid',
          completedAt: new Date()
        }
      })

      // สร้าง enrollment สำหรับคอร์สที่สั่งซื้อ
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: receipt.orderId }
      })

      for (const item of orderItems) {
        await prisma.courseEnrollment.upsert({
          where: {
            userId_courseId: {
              userId: receipt.order.user.id,
              courseId: item.courseId
            }
          },
          update: {
            isActive: true
          },
          create: {
            userId: receipt.order.user.id,
            courseId: item.courseId,
            isActive: true
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment receipt updated successfully',
      data: receipt
    })
  } catch (error) {
    console.error('Error updating payment receipt:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update payment receipt', error: error.message },
      { status: 500 }
    )
  }
}