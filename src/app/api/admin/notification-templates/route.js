import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/notification-templates - ดึงรายการเทมเพลตการแจ้งเตือน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const isActive = searchParams.get('active')

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const notificationTemplates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { notificationTemplates }
    })
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notification templates', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/notification-templates - สร้างเทมเพลตการแจ้งเตือนใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const notificationTemplate = await prisma.notificationTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        titleTemplate: body.titleTemplate,
        contentTemplate: body.contentTemplate,
        channels: body.channels || {},
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification template created successfully',
      data: notificationTemplate
    })
  } catch (error) {
    console.error('Error creating notification template:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create notification template', error: error.message },
      { status: 500 }
    )
  }
}