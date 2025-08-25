import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/discussions - ดึงรายการกระทู้สนทนา
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')
    const userId = searchParams.get('userId')
    const isSticky = searchParams.get('sticky')
    const isClosed = searchParams.get('closed')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(courseId && { courseId }),
      ...(lessonId && { lessonId }),
      ...(userId && { userId }),
      ...(isSticky !== null && { isSticky: isSticky === 'true' }),
      ...(isClosed !== null && { isClosed: isClosed === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
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

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
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
          course: {
            select: {
              id: true,
              title: true
            }
          },
          lesson: {
            select: {
              id: true,
              title: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { updatedAt: 'desc' }
        ]
      }),
      prisma.discussion.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        discussions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch discussions', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/discussions - สร้างกระทู้สนทนาใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const discussion = await prisma.discussion.create({
      data: {
        courseId: body.courseId,
        lessonId: body.lessonId,
        userId: body.userId,
        title: body.title,
        content: body.content,
        isSticky: body.isSticky || false,
        isClosed: body.isClosed || false
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
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Discussion created successfully',
      data: discussion
    })
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create discussion', error: error.message },
      { status: 500 }
    )
  }
}