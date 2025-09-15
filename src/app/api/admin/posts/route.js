import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters for filtering and pagination
    const search = searchParams.get('search') || '';
    const postTypeId = searchParams.get('postTypeId') || '';
    const authorId = searchParams.get('authorId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'created_desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;

    // Build where clause
    const where = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            excerpt: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }),
      ...(postTypeId && {
        postTypeId: postTypeId
      }),
      ...(authorId && {
        authorId: authorId
      }),
      ...(dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo + 'T23:59:59.999Z') })
        }
      }
    };

    // Build orderBy clause
    let orderBy = { createdAt: 'desc' }; // default
    switch (sortBy) {
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'author_asc':
        orderBy = { author: { name: 'asc' } };
        break;
      case 'author_desc':
        orderBy = { author: { name: 'desc' } };
        break;
      case 'type_asc':
        orderBy = { postType: { name: 'asc' } };
        break;
      case 'type_desc':
        orderBy = { postType: { name: 'desc' } };
        break;
      case 'published_desc':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'published_asc':
        orderBy = { publishedAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get filtered and paginated posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        postType: {
          select: {
            id: true,
            name: true
          }
        },
        postContents: {
          select: {
            id: true,
            urlImg: true,
            name: true,
            description: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy,
      skip,
      take: pageSize
    });

    // Pagination metadata
    const pagination = {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return NextResponse.json({
      success: true,
      data: posts,
      pagination,
      filters: {
        search,
        postTypeId,
        authorId,
        dateFrom,
        dateTo,
        sortBy
      }
    });
  } catch (error) {
    console.error('GET /api/admin/posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // สร้าง slug อัตโนมัติถ้าไม่มี
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // แปลง publishedAt เป็น Date object ถ้ามี
    if (data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    // ใช้ user id แรกเป็น author (ในการใช้งานจริงควรใช้ session)
    const firstUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!firstUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        ...data,
        authorId: firstUser.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        postType: {
          select: {
            id: true,
            name: true
          }
        },
        postContents: {
          select: {
            id: true,
            urlImg: true,
            name: true,
            description: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}