import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/quiz-attempts - ดึงรายการการทำควิซ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const quizId = searchParams.get('quizId')
    const userId = searchParams.get('userId')
    const isPassed = searchParams.get('passed')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(quizId && { quizId }),
      ...(userId && { userId }),
      ...(isPassed !== null && { isPassed: isPassed === 'true' }),
      ...(search && {
        OR: [
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }},
          { quiz: { title: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    const [quizAttempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
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
          quiz: {
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
          },
          _count: {
            select: {
              answers: true
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      }),
      prisma.quizAttempt.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        quizAttempts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching quiz attempts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quiz attempts', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/quiz-attempts - สร้างการทำควิซใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId: body.quizId,
        userId: body.userId,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        score: body.score,
        isPassed: body.isPassed,
        timeSpent: body.timeSpent
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
        quiz: {
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
        }
      }
    })

    // สร้างคำตอบถ้ามี
    if (body.answers && body.answers.length > 0) {
      await prisma.quizAttemptAnswer.createMany({
        data: body.answers.map(answer => ({
          attemptId: quizAttempt.id,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned || 0
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz attempt created successfully',
      data: quizAttempt
    })
  } catch (error) {
    console.error('Error creating quiz attempt:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create quiz attempt', error: error.message },
      { status: 500 }
    )
  }
}