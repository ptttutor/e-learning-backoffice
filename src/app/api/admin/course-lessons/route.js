import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/course-lessons - ดึงรายการบทเรียนย่อย
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search') || ''
    const contentType = searchParams.get('contentType')
    const isPublished = searchParams.get('published')
    const isFree = searchParams.get('free')

    const where = {
      ...(chapterId && { chapterId }),
      ...(courseId && { 
        chapter: {
          courseId
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(contentType && { contentType }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' }),
      ...(isFree !== null && { isFree: isFree === 'true' })
    }

    const lessons = await prisma.courseLesson.findMany({
      where,
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
        },
        _count: {
          select: {
            lessonProgress: true,
            quizzes: true,
            discussions: true
          }
        }
      },
      orderBy: [
        { chapter: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { lessons }
    })
  } catch (error) {
    console.error('Error fetching course lessons:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course lessons', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/course-lessons - สร้างบทเรียนย่อยใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const lesson = await prisma.courseLesson.create({
      data: {
        chapterId: body.chapterId,
        title: body.title,
        contentType: body.contentType,
        contentUrl: body.contentUrl,
        contentData: body.contentData,
        description: body.description,
        durationMinutes: body.durationMinutes,
        sortOrder: body.sortOrder || 0,
        isPublished: body.isPublished || false,
        isFree: body.isFree || false
      },
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
    })

    return NextResponse.json({
      success: true,
      message: 'Course lesson created successfully',
      data: lesson
    })
  } catch (error) {
    console.error('Error creating course lesson:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course lesson', error: error.message },
      { status: 500 }
    )
  }
}