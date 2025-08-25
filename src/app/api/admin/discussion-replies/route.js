import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/discussion-replies - ดึงรายการการตอบกลับในกระทู้สนทนา
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const discussionId = searchParams.get('discussionId')
    const userId = searchParams.get('userId')
    const parentId = searchParams.get('parentId')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(discussionId && { discussionId }),
      ...(userId && { userId }),
      ...(parentId !== undefined && { parentId: parentId || null }),
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

    const [discussionReplies, total] = await Promise.all([
      prisma.discussionReply.findMany({
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
          discussion: {
            include: {
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
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.discussionReply.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        discussionReplies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching discussion replies:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch discussion replies', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/discussion-replies - สร้างการตอบกลับในกระทู้สนทนาใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const discussionReply = await prisma.discussionReply.create({
      data: {
        discussionId: body.discussionId,
        userId: body.userId,
        content: body.content,
        parentId: body.parentId
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
        discussion: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // อัพเดทจำนวนการตอบกลับในกระทู้
    await prisma.discussion.update({
      where: { id: body.discussionId },
      data: {
        replyCount: {
          increment: 1
        },
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Discussion reply created successfully',
      data: discussionReply
    })
  } catch (error) {
    console.error('Error creating discussion reply:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create discussion reply', error: error.message },
      { status: 500 }
    )
  }
}