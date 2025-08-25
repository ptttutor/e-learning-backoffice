import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/learning-paths - ดึงรายการเส้นทางการเรียน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const difficultyLevel = searchParams.get('difficultyLevel')
    const isPublished = searchParams.get('published')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' })
    }

    const [learningPaths, total] = await Promise.all([
      prisma.learningPath.findMany({
        where,
        skip,
        take: limit,
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnailImage: true,
                  price: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.learningPath.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        learningPaths,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch learning paths', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/learning-paths - สร้างเส้นทางการเรียนใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const learningPath = await prisma.learningPath.create({
      data: {
        name: body.name,
        description: body.description,
        estimatedDurationHours: body.estimatedDurationHours,
        difficultyLevel: body.difficultyLevel,
        isPublished: body.isPublished || false
      }
    })

    // เพิ่มคอร์สในเส้นทางการเรียน
    if (body.courseIds && body.courseIds.length > 0) {
      await prisma.learningPathCourse.createMany({
        data: body.courseIds.map((courseId, index) => ({
          learningPathId: learningPath.id,
          courseId,
          sortOrder: index
        }))
      })

      // อัพเดท totalCourses
      await prisma.learningPath.update({
        where: { id: learningPath.id },
        data: { totalCourses: body.courseIds.length }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Learning path created successfully',
      data: learningPath
    })
  } catch (error) {
    console.error('Error creating learning path:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create learning path', error: error.message },
      { status: 500 }
    )
  }
}