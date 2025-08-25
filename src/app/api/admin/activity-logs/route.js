import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/activity-logs - ดึงรายการ activity logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const tableName = searchParams.get('tableName')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(tableName && { tableName }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } })
    }

    const [activityLogs, total] = await Promise.all([
      prisma.activityLog.findMany({
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        activityLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch activity logs', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/activity-logs - สร้าง activity log ใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const activityLog = await prisma.activityLog.create({
      data: {
        userId: body.userId,
        action: body.action,
        tableName: body.tableName,
        recordId: body.recordId,
        oldData: body.oldData,
        newData: body.newData,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent
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
      message: 'Activity log created successfully',
      data: activityLog
    })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create activity log', error: error.message },
      { status: 500 }
    )
  }
}