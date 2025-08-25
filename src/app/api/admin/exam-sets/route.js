import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exam-sets - ดึงรายการชุดข้อสอบ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const examTypeId = searchParams.get('examTypeId')
    const subjectId = searchParams.get('subjectId')
    const examYear = searchParams.get('examYear')
    const difficultyLevel = searchParams.get('difficultyLevel')
    const isPublished = searchParams.get('published')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { setNumber: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(examTypeId && { examTypeId }),
      ...(subjectId && { subjectId }),
      ...(examYear && { examYear: parseInt(examYear) }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(isPublished !== null && { isPublished: isPublished === 'true' })
    }

    const [examSets, total] = await Promise.all([
      prisma.examSet.findMany({
        where,
        skip,
        take: limit,
        include: {
          examType: true,
          subject: true
        },
        orderBy: [
          { examYear: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.examSet.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        examSets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching exam sets:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch exam sets', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/exam-sets - สร้างชุดข้อสอบใหม่
export async function POST(request) {
  try {
    const body = await request.json()

    const examSet = await prisma.examSet.create({
      data: {
        title: body.title,
        examTypeId: body.examTypeId,
        subjectId: body.subjectId,
        examYear: body.examYear,
        setNumber: body.setNumber,
        examMonth: body.examMonth,
        fileUrl: body.fileUrl,
        answerKeyUrl: body.answerKeyUrl,
        explanationUrl: body.explanationUrl,
        totalQuestions: body.totalQuestions,
        timeLimitMinutes: body.timeLimitMinutes,
        difficultyLevel: body.difficultyLevel,
        isPublished: body.isPublished || false
      },
      include: {
        examType: true,
        subject: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam set created successfully',
      data: examSet
    })
  } catch (error) {
    console.error('Error creating exam set:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create exam set', error: error.message },
      { status: 500 }
    )
  }
}