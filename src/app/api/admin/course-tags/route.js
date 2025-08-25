import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/course-tags - ดึงรายการแท็กคอร์ส
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const courseTags = await prisma.courseTag.findMany({
      where,
      include: {
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { courseTags }
    })
  } catch (error) {
    console.error('Error fetching course tags:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course tags', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/course-tags - สร้างแท็กคอร์สใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingTag = await prisma.courseTag.findUnique({
        where: { slug: body.slug }
      })

      if (existingTag) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const courseTag = await prisma.courseTag.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course tag created successfully',
      data: courseTag
    })
  } catch (error) {
    console.error('Error creating course tag:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course tag', error: error.message },
      { status: 500 }
    )
  }
}