import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/articles - ดึงรายการบทความ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const authorId = searchParams.get('authorId')
    const status = searchParams.get('status')
    const isFeatured = searchParams.get('featured')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(authorId && { authorId }),
      ...(status && { status }),
      ...(isFeatured !== null && { isFeatured: isFeatured === 'true' })
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch articles', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/articles - สร้างบทความใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ slug ซ้ำ
    if (body.slug) {
      const existingArticle = await prisma.article.findUnique({
        where: { slug: body.slug }
      })

      if (existingArticle) {
        return NextResponse.json(
          { success: false, message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        content: body.content,
        excerpt: body.excerpt,
        featuredImage: body.featuredImage,
        authorId: body.authorId,
        categoryId: body.categoryId,
        status: body.status || 'draft',
        isFeatured: body.isFeatured || false,
        publishedAt: body.status === 'published' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true
      }
    })

    // เพิ่ม tags ถ้ามี
    if (body.tagIds && body.tagIds.length > 0) {
      await prisma.articleTagRelation.createMany({
        data: body.tagIds.map(tagId => ({
          articleId: article.id,
          tagId
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      data: article
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create article', error: error.message },
      { status: 500 }
    )
  }
}