import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/review-replies - ดึงรายการการตอบกลับรีวิว
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const reviewId = searchParams.get('reviewId')
    const userId = searchParams.get('userId')
    const isPublished = searchParams.get('published')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(reviewId && { reviewId }),
      ...(userId && { userId }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' }),
      ...(search && {
        OR: [
          { content: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ]
      })
    }

    const [reviewReplies, total] = await Promise.all([
      prisma.reviewReply.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          review: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true
                }
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.reviewReply.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviewReplies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching review replies:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review replies', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/review-replies - สร้างการตอบกลับรีวิวใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const reviewReply = await prisma.reviewReply.create({
      data: {
        reviewId: body.reviewId,
        userId: body.userId,
        content: body.content,
        isPublished: body.isPublished !== undefined ? body.isPublished : true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        review: {
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
      message: 'Review reply created successfully',
      data: reviewReply
    })
  } catch (error) {
    console.error('Error creating review reply:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create review reply', error: error.message },
      { status: 500 }
    )
  }
}