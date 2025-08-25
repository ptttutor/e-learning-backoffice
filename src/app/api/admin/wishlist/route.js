import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/wishlist - ดึงรายการ wishlist
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(courseId && { courseId }),
      ...(search && {
        OR: [
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }},
          { course: { title: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    const [wishlistItems, total] = await Promise.all([
      prisma.wishlist.findMany({
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
          course: {
            select: {
              id: true,
              title: true,
              thumbnailImage: true,
              price: true,
              isPublished: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wishlist.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        wishlistItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/wishlist - เพิ่มรายการใน wishlist
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่ามีในรายการแล้วหรือยัง
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: body.userId,
          courseId: body.courseId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Course already in wishlist' },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: body.userId,
        courseId: body.courseId
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
        course: {
          select: {
            id: true,
            title: true,
            thumbnailImage: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Course added to wishlist successfully',
      data: wishlistItem
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add to wishlist', error: error.message },
      { status: 500 }
    )
  }
}