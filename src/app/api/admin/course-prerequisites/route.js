import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/course-prerequisites - ดึงรายการข้อกำหนดเบื้องต้นของคอร์ส
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const prerequisiteCourseId = searchParams.get('prerequisiteCourseId')
    const isRequired = searchParams.get('required')

    const where = {
      ...(courseId && { courseId }),
      ...(prerequisiteCourseId && { prerequisiteCourseId }),
      ...(isRequired !== null && { isRequired: isRequired === 'true' })
    }

    const coursePrerequisites = await prisma.coursePrerequisite.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailImage: true
          }
        },
        prerequisiteCourse: {
          select: {
            id: true,
            title: true,
            thumbnailImage: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { coursePrerequisites }
    })
  } catch (error) {
    console.error('Error fetching course prerequisites:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course prerequisites', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/course-prerequisites - สร้างข้อกำหนดเบื้องต้นของคอร์สใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่ามีข้อกำหนดเบื้องต้นแล้วหรือยัง
    const existingPrerequisite = await prisma.coursePrerequisite.findUnique({
      where: {
        courseId_prerequisiteCourseId: {
          courseId: body.courseId,
          prerequisiteCourseId: body.prerequisiteCourseId
        }
      }
    })

    if (existingPrerequisite) {
      return NextResponse.json(
        { success: false, message: 'Course prerequisite already exists' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าไม่ใช่คอร์สเดียวกัน
    if (body.courseId === body.prerequisiteCourseId) {
      return NextResponse.json(
        { success: false, message: 'Course cannot be prerequisite of itself' },
        { status: 400 }
      )
    }

    const coursePrerequisite = await prisma.coursePrerequisite.create({
      data: {
        courseId: body.courseId,
        prerequisiteCourseId: body.prerequisiteCourseId,
        isRequired: body.isRequired !== undefined ? body.isRequired : true
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        prerequisiteCourse: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course prerequisite created successfully',
      data: coursePrerequisite
    })
  } catch (error) {
    console.error('Error creating course prerequisite:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course prerequisite', error: error.message },
      { status: 500 }
    )
  }
}