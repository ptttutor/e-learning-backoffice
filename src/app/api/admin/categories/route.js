import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/categories - ดึงรายการหมวดหมู่ทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const search = searchParams.get('search') || ''
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(parentId !== undefined && { parentId: parentId || null }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              subjects: true,
              articles: true,
              children: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - สร้างหมวดหมู่ใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: body.slug }
      })

      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: body.description,
        parentId: body.parentId,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        parent: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    )
  }
}