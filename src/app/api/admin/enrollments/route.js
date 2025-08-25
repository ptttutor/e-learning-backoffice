import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/enrollments - ดึงรายการการลงทะเบียน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const isActive = searchParams.get('active')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(courseId && { courseId }),
      ...(userId && { userId }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }},
          { course: { title: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    const [enrollments, total] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              thumbnailImage: true,
              price: true
            }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      }),
      prisma.courseEnrollment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch enrollments', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/enrollments - สร้างการลงทะเบียนใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่าลงทะเบียนแล้วหรือยัง
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: body.userId,
          courseId: body.courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'User already enrolled in this course' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: body.userId,
        courseId: body.courseId,
        isActive: body.isActive !== undefined ? body.isActive : true
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
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create enrollment', error: error.message },
      { status: 500 }
    )
  }
}