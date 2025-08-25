import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - ดึงรายการผู้ใช้ทั้งหมด (Admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const role = searchParams.get('role')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    const where = {
      ...(role && { role }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              courseEnrollments: true,
              courses: true,
              orders: true,
              courseReviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          passwordHash: undefined // ไม่ส่ง password hash
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - สร้างผู้ใช้ใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ email ซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    let passwordHash = null
    if (body.password) {
      passwordHash = await bcrypt.hash(body.password, 12)
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        profileImage: body.profileImage,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        role: body.role || 'student',
        isActive: body.isActive !== undefined ? body.isActive : true,
        emailVerified: body.emailVerified || false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        ...user,
        passwordHash: undefined
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user', error: error.message },
      { status: 500 }
    )
  }
}