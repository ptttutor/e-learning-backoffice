import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/announcement-types - ดึงรายการประเภทประกาศ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('active')

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const announcementTypes = await prisma.announcementType.findMany({
      where,
      include: {
        _count: {
          select: {
            announcements: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { announcementTypes }
    })
  } catch (error) {
    console.error('Error fetching announcement types:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcement types', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/announcement-types - สร้างประเภทประกาศใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    const announcementType = await prisma.announcementType.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: body.description,
        color: body.color,
        icon: body.icon,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement type created successfully',
      data: announcementType
    })
  } catch (error) {
    console.error('Error creating announcement type:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create announcement type', error: error.message },
      { status: 500 }
    )
  }
}