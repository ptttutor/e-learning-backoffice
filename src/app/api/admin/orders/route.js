import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/orders - ดึงรายการออเดอร์ทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ]
      }),
      ...(status && { status }),
      ...(userId && { userId }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } })
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
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
                  title: true,
                  thumbnailImage: true
                }
              }
            }
          },
          promotion: {
            select: {
              id: true,
              title: true,
              code: true,
              discountType: true,
              discountValue: true
            }
          },
          paymentReceipt: {
            select: {
              id: true,
              status: true,
              receiptImage: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders - สร้างออเดอร์ใหม่ (สำหรับ admin)
export async function POST(request) {
  try {
    const body = await request.json()
    
    // สร้าง order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // คำนวณราคารวม
    let totalAmount = 0
    const courseIds = body.courseIds || []
    
    if (courseIds.length > 0) {
      const courses = await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, price: true }
      })
      
      totalAmount = courses.reduce((sum, course) => sum + Number(course.price), 0)
    }

    // คำนวณส่วนลด
    let discountAmount = 0
    let promotion = null
    
    if (body.promotionId) {
      promotion = await prisma.promotion.findUnique({
        where: { id: body.promotionId }
      })
      
      if (promotion && promotion.isActive) {
        if (promotion.discountType === 'percentage') {
          discountAmount = (totalAmount * Number(promotion.discountValue)) / 100
          if (promotion.maximumDiscount) {
            discountAmount = Math.min(discountAmount, Number(promotion.maximumDiscount))
          }
        } else {
          discountAmount = Number(promotion.discountValue)
        }
      }
    }

    const finalAmount = totalAmount - discountAmount

    const order = await prisma.order.create({
      data: {
        userId: body.userId,
        orderNumber,
        totalAmount,
        discountAmount,
        finalAmount,
        promotionId: body.promotionId,
        status: body.status || 'pending',
        paymentMethod: body.paymentMethod || 'manual_transfer',
        notes: body.notes,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        items: {
          create: courseIds.map(courseId => ({
            courseId,
            price: courses.find(c => c.id === courseId)?.price || 0
          }))
        }
      },
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
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    )
  }
}