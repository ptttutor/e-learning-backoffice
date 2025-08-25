import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exam-types - ดึงรายการประเภทข้อสอบ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [examTypes, total] = await Promise.all([
      prisma.examType.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              examSets: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.examType.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        examTypes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching exam types:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch exam types', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/exam-types - สร้างประเภทข้อสอบใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingExamType = await prisma.examType.findUnique({
        where: { slug: body.slug }
      })

      if (existingExamType) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const examType = await prisma.examType.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: body.description,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam type created successfully',
      data: examType
    })
  } catch (error) {
    console.error('Error creating exam type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create exam type', error: error.message },
      { status: 500 }
    )
  }
}