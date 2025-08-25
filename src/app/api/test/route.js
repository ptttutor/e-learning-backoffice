import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // ทดสอบการเชื่อมต่อ database
    const userCount = await prisma.user.count()
    const courseCount = await prisma.course.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        courses: courseCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // สร้าง user ตัวอย่าง
    const user = await prisma.user.create({
      data: {
        email: body.email || 'test@example.com',
        firstName: body.firstName || 'Test',
        lastName: body.lastName || 'User',
        role: body.role || 'student'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error.message
      },
      { status: 500 }
    )
  }
}