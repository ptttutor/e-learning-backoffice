import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses/[id] - ดึงข้อมูลคอร์สรายคน
export async function GET(request, { params }) {
  try {
    const { id } = params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        },
        chapters: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        enrollments: {
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
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            orderItems: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course', error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/courses/[id] - อัพเดทคอร์ส
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // ตรวจสอบว่าคอร์สมีอยู่
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบ slug ซ้ำ (ถ้ามีการเปลี่ยน slug)
    if (body.slug && body.slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug: body.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const updateData = {
      ...(body.title && { title: body.title }),
      ...(body.slug && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
      ...(body.thumbnailImage !== undefined && { thumbnailImage: body.thumbnailImage }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.subjectId !== undefined && { subjectId: body.subjectId }),
      ...(body.teacherId !== undefined && { teacherId: body.teacherId }),
      ...(body.level !== undefined && { level: body.level }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice }),
      ...(body.durationHours !== undefined && { durationHours: body.durationHours }),
      ...(body.requirements !== undefined && { requirements: body.requirements }),
      ...(body.whatYouLearn !== undefined && { whatYouLearn: body.whatYouLearn }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder })
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        teacher: {
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
      message: 'Course updated successfully',
      data: course
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update course', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id] - ลบคอร์ส
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // ตรวจสอบว่าคอร์สมีอยู่
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            orderItems: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่ามีการลงทะเบียนหรือการสั่งซื้อหรือไม่
    if (existingCourse._count.enrollments > 0 || existingCourse._count.orderItems > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete course with existing enrollments or orders. Consider unpublishing instead.' 
        },
        { status: 400 }
      )
    }

    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete course', error: error.message },
      { status: 500 }
    )
  }
}