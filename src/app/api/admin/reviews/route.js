import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/reviews - ดึงรายการรีวิว
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const rating = searchParams.get('rating')
    const isPublished = searchParams.get('published')
    const isVerifiedPurchase = searchParams.get('verified')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(courseId && { courseId }),
      ...(userId && { userId }),
      ...(rating && { rating: parseInt(rating) }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' }),
      ...(isVerifiedPurchase !== null && { isVerifiedPurchase: isVerifiedPurchase === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }},
          { course: { title: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    const [reviews, total] = await Promise.all([
      prisma.courseReview.findMany({
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
              thumbnailImage: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.courseReview.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/reviews - สร้างรีวิวใหม่ (สำหรับ admin)
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่ารีวิวแล้วหรือยัง
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        courseId_userId: {
          courseId: body.courseId,
          userId: body.userId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'User already reviewed this course' },
        { status: 400 }
      )
    }

    const review = await prisma.courseReview.create({
      data: {
        courseId: body.courseId,
        userId: body.userId,
        rating: body.rating,
        title: body.title,
        content: body.content,
        isVerifiedPurchase: body.isVerifiedPurchase || false,
        isPublished: body.isPublished !== undefined ? body.isPublished : true
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
      message: 'Review created successfully',
      data: review
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create review', error: error.message },
      { status: 500 }
    )
  }
}