import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/certificates - ดึงรายการใบประกาศนียบัตร
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const isValid = searchParams.get('valid')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(courseId && { courseId }),
      ...(isValid !== null && { isValid: isValid === 'true' }),
      ...(search && {
        OR: [
          { certificateNumber: { contains: search, mode: 'insensitive' } },
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

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
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
              thumbnailImage: true
            }
          }
        },
        orderBy: { issuedDate: 'desc' }
      }),
      prisma.certificate.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        certificates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch certificates', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/certificates - สร้างใบประกาศนียบัตรใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่ามีใบประกาศนียบัตรแล้วหรือยัง
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: body.userId,
          courseId: body.courseId
        }
      }
    })

    if (existingCertificate) {
      return NextResponse.json(
        { success: false, message: 'Certificate already exists for this user and course' },
        { status: 400 }
      )
    }

    // สร้างเลขที่ใบประกาศนียบัตร
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const certificate = await prisma.certificate.create({
      data: {
        userId: body.userId,
        courseId: body.courseId,
        certificateNumber,
        certificateUrl: body.certificateUrl,
        isValid: body.isValid !== undefined ? body.isValid : true
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
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate
    })
  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create certificate', error: error.message },
      { status: 500 }
    )
  }
}