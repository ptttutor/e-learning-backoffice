import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/lesson-progress - ดึงรายการความก้าวหน้าบทเรียน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const userId = searchParams.get('userId')
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')
    const isCompleted = searchParams.get('completed')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(lessonId && { lessonId }),
      ...(courseId && { 
        lesson: {
          chapter: {
            courseId
          }
        }
      }),
      ...(isCompleted !== null && { isCompleted: isCompleted === 'true' }),
      ...(search && {
        OR: [
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }},
          { lesson: { title: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    const [lessonProgress, total] = await Promise.all([
      prisma.lessonProgress.findMany({
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
          },
          lesson: {
            include: {
              chapter: {
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
          }
        },
        orderBy: { lastAccessedAt: 'desc' }
      }),
      prisma.lessonProgress.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        lessonProgress,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch lesson progress', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/lesson-progress - สร้างความก้าวหน้าบทเรียนใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: body.userId,
          lessonId: body.lessonId
        }
      },
      update: {
        isCompleted: body.isCompleted,
        watchTime: body.watchTime,
        completionPercentage: body.completionPercentage,
        completedAt: body.isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
        notes: body.notes,
        bookmarks: body.bookmarks
      },
      create: {
        userId: body.userId,
        lessonId: body.lessonId,
        isCompleted: body.isCompleted || false,
        watchTime: body.watchTime || 0,
        completionPercentage: body.completionPercentage || 0,
        completedAt: body.isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
        notes: body.notes,
        bookmarks: body.bookmarks
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
        lesson: {
          include: {
            chapter: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson progress updated successfully',
      data: lessonProgress
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update lesson progress', error: error.message },
      { status: 500 }
    )
  }
}