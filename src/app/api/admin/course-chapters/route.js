import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/course-chapters - ดึงรายการบทเรียน
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search') || ''
    const isPublished = searchParams.get('published')

    const where = {
      ...(courseId && { courseId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' })
    }

    const chapters = await prisma.courseChapter.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            lessons: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { chapters }
    })
  } catch (error) {
    console.error('Error fetching course chapters:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course chapters', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/course-chapters - สร้างบทเรียนใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const chapter = await prisma.courseChapter.create({
      data: {
        courseId: body.courseId,
        title: body.title,
        description: body.description,
        sortOrder: body.sortOrder || 0,
        isPublished: body.isPublished || false
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course chapter created successfully',
      data: chapter
    })
  } catch (error) {
    console.error('Error creating course chapter:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course chapter', error: error.message },
      { status: 500 }
    )
  }
}