import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/payment-receipts - ดึงรายการใบเสร็จการชำระเงิน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')
    const reviewedBy = searchParams.get('reviewedBy')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(orderId && { orderId }),
      ...(reviewedBy && { reviewedBy }),
      ...(search && {
        OR: [
          { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
          { order: { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }}},
          { bankName: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [receipts, total] = await Promise.all([
      prisma.paymentReceipt.findMany({
        where,
        skip,
        take: limit,
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
              },
              items: {
                include: {
                  course: {
                    select: {
                      id: true,
                      title: true
                    }
                  }
                }
              }
            }
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.paymentReceipt.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        receipts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching payment receipts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment receipts', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/payment-receipts - สร้างใบเสร็จใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const receipt = await prisma.paymentReceipt.create({
      data: {
        orderId: body.orderId,
        receiptImage: body.receiptImage,
        bankName: body.bankName,
        transferDate: body.transferDate ? new Date(body.transferDate) : null,
        transferAmount: body.transferAmount,
        transferTime: body.transferTime ? new Date(body.transferTime) : null,
        notes: body.notes,
        status: body.status || 'pending'
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment receipt created successfully',
      data: receipt
    })
  } catch (error) {
    console.error('Error creating payment receipt:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create payment receipt', error: error.message },
      { status: 500 }
    )
  }
}