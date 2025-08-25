import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/subjects - ดึงรายการวิชาทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: {
              courses: true,
              examSets: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.subject.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        subjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subjects', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/subjects - สร้างวิชาใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingSubject = await prisma.subject.findUnique({
        where: { slug: body.slug }
      })

      if (existingSubject) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const subject = await prisma.subject.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: body.description,
        categoryId: body.categoryId,
        color: body.color,
        icon: body.icon,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create subject', error: error.message },
      { status: 500 }
    )
  }
}