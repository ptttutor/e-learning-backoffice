import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/quiz-questions - ดึงรายการคำถามควิซ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const quizId = searchParams.get('quizId')
    const questionType = searchParams.get('questionType')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(quizId && { quizId }),
      ...(questionType && { questionType }),
      ...(search && {
        question: { contains: search, mode: 'insensitive' }
      })
    }

    const [quizQuestions, total] = await Promise.all([
      prisma.quizQuestion.findMany({
        where,
        skip,
        take: limit,
        include: {
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
        orderBy: [
          { quiz: { title: 'asc' } },
          { sortOrder: 'asc' }
        ]
      }),
      prisma.quizQuestion.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        quizQuestions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching quiz questions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quiz questions', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/quiz-questions - สร้างคำถามควิซใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        quizId: body.quizId,
        question: body.question,
        questionType: body.questionType,
        options: body.options,
        correctAnswer: body.correctAnswer,
        points: body.points || 1,
        sortOrder: body.sortOrder || 0
      },
      include: {
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

    return NextResponse.json({
      success: true,
      message: 'Quiz question created successfully',
      data: quizQuestion
    })
  } catch (error) {
    console.error('Error creating quiz question:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create quiz question', error: error.message },
      { status: 500 }
    )
  }
}