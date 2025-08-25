import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/user-sessions - ดึงรายการเซสชันผู้ใช้
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const userId = searchParams.get('userId')
    const isActive = searchParams.get('active')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { sessionToken: { contains: search, mode: 'insensitive' } },
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

    const [userSessions, total] = await Promise.all([
      prisma.userSession.findMany({
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
              role: true
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      }),
      prisma.userSession.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        userSessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user sessions', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/user-sessions - สร้างเซสชันผู้ใช้ใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    // สร้าง session token
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`

    const userSession = await prisma.userSession.create({
      data: {
        userId: body.userId,
        sessionToken,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User session created successfully',
      data: userSession
    })
  } catch (error) {
    console.error('Error creating user session:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user session', error: error.message },
      { status: 500 }
    )
  }
}