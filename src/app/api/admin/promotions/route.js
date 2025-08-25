import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/promotions - ดึงรายการโปรโมชั่น
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const discountType = searchParams.get('discountType')
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(discountType && { discountType }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              orders: true,
              usage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.promotion.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        promotions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promotions', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/promotions - สร้างโปรโมชั่นใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ code ซ้ำ (ถ้ามี)
    if (body.code) {
      const existingPromotion = await prisma.promotion.findUnique({
        where: { code: body.code }
      })

      if (existingPromotion) {
        return NextResponse.json(
          { success: false, message: 'Promotion code already exists' },
          { status: 400 }
        )
      }
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: body.title,
        description: body.description,
        code: body.code,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minimumPurchase: body.minimumPurchase || 0,
        maximumDiscount: body.maximumDiscount,
        usageLimit: body.usageLimit,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create promotion', error: error.message },
      { status: 500 }
    )
  }
}