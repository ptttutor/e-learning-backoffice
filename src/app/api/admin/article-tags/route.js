import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/article-tags - ดึงรายการแท็กบทความ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const tags = await prisma.articleTag.findMany({
      where,
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { tags }
    })
  } catch (error) {
    console.error('Error fetching article tags:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch article tags', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/article-tags - สร้างแท็กบทความใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingTag = await prisma.articleTag.findUnique({
        where: { slug: body.slug }
      })

      if (existingTag) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const tag = await prisma.articleTag.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article tag created successfully',
      data: tag
    })
  } catch (error) {
    console.error('Error creating article tag:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create article tag', error: error.message },
      { status: 500 }
    )
  }
}