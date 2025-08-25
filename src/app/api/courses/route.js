import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses - ดึงรายการคอร์สทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const subjectId = searchParams.get('subjectId')
    const isPublished = searchParams.get('published') === 'true'

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(subjectId && { subjectId }),
      ...(isPublished !== undefined && { isPublished })
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.course.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      },
      { status: 500 }
    )
  }
}

// POST /api/courses - สร้างคอร์สใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        shortDescription: body.shortDescription,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
        level: body.level,
        price: body.price || 0,
        originalPrice: body.originalPrice,
        durationHours: body.durationHours,
        requirements: body.requirements,
        whatYouLearn: body.whatYouLearn,
        isPublished: body.isPublished || false,
        isFeatured: body.isFeatured || false
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      data: course
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create course',
        error: error.message
      },
      { status: 500 }
    )
  }
}