import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/notifications - ดึงรายการการแจ้งเตือน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const isRead = searchParams.get('read')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(type && { type }),
      ...(isRead !== null && { isRead: isRead === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ]
      })
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { sentAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications - ส่งการแจ้งเตือนใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    // ถ้าส่งให้ทุกคน
    if (body.sendToAll) {
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          ...(body.targetRole && { role: body.targetRole })
        },
        select: { id: true }
      })

      const notifications = users.map(user => ({
        userId: user.id,
        title: body.title,
        content: body.content,
        type: body.type,
        data: body.data,
        channels: body.channels
      }))

      await prisma.notification.createMany({
        data: notifications
      })

      return NextResponse.json({
        success: true,
        message: `Notifications sent to ${users.length} users`,
        data: { count: users.length }
      })
    } else {
      // ส่งให้ผู้ใช้คนเดียว
      const notification = await prisma.notification.create({
        data: {
          userId: body.userId,
          title: body.title,
          content: body.content,
          type: body.type,
          data: body.data,
          channels: body.channels
        },
        include: {
          user: {
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
        message: 'Notification sent successfully',
        data: notification
      })
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send notification', error: error.message },
      { status: 500 }
    )
  }
}