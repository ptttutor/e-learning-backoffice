import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/announcements - ดึงรายการประกาศทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const typeId = searchParams.get('typeId')
    const priority = searchParams.get('priority')
    const targetAudience = searchParams.get('targetAudience')
    const isPublished = searchParams.get('published')
    const isPinned = searchParams.get('pinned')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(typeId && { typeId }),
      ...(priority && { priority }),
      ...(targetAudience && { targetAudience }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' }),
      ...(isPinned !== null && { isPinned: isPinned === 'true' })
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        include: {
          type: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.announcement.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcements', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/announcements - สร้างประกาศใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        typeId: body.typeId,
        authorId: body.authorId,
        priority: body.priority || 'normal',
        isPinned: body.isPinned || false,
        attachmentUrl: body.attachmentUrl,
        targetAudience: body.targetAudience || 'all',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isPublished: body.isPublished || false
      },
      include: {
        type: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create announcement', error: error.message },
      { status: 500 }
    )
  }
}