import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users/[id] - ดึงข้อมูลผู้ใช้รายคน
export async function GET(request, { params }) {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        socialLogins: true,
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnailImage: true,
                price: true
              }
            }
          }
        },
        courses: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            createdAt: true
          }
        },
        orders: {
          include: {
            items: {
              include: {
                course: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            courseEnrollments: true,
            courses: true,
            orders: true,
            courseReviews: true,
            notifications: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        passwordHash: undefined
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - อัพเดทข้อมูลผู้ใช้
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // ตรวจสอบว่าผู้ใช้มีอยู่
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบ email ซ้ำ (ถ้ามีการเปลี่ยน email)
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    const updateData = {
      ...(body.email && { email: body.email }),
      ...(body.firstName && { firstName: body.firstName }),
      ...(body.lastName && { lastName: body.lastName }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.profileImage !== undefined && { profileImage: body.profileImage }),
      ...(body.dateOfBirth !== undefined && { 
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null 
      }),
      ...(body.gender !== undefined && { gender: body.gender }),
      ...(body.role && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.emailVerified !== undefined && { emailVerified: body.emailVerified })
    }

    // Hash password ใหม่ถ้ามี
    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        ...user,
        passwordHash: undefined
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - ลบผู้ใช้
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // ตรวจสอบว่าผู้ใช้มีอยู่
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user', error: error.message },
      { status: 500 }
    )
  }
}