import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/quizzes - ดึงรายการควิซ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search') || ''
    const isPublished = searchParams.get('published')

    const skip = (page - 1) * limit

    const where = {
      ...(lessonId && { lessonId }),
      ...(courseId && { 
        lesson: {
          chapter: {
            courseId
          }
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' })
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        include: {
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
          },
          _count: {
            select: {
              questions: true,
              attempts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.quiz.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quizzes', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/quizzes - สร้างควิซใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const quiz = await prisma.quiz.create({
      data: {
        lessonId: body.lessonId,
        title: body.title,
        description: body.description,
        timeLimit: body.timeLimit,
        maxAttempts: body.maxAttempts,
        passingScore: body.passingScore || 70,
        isPublished: body.isPublished || false
      },
      include: {
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
      message: 'Quiz created successfully',
      data: quiz
    })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create quiz', error: error.message },
      { status: 500 }
    )
  }
}