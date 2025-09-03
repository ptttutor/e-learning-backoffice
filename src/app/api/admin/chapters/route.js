import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/chapters?courseId=... - list all chapters for a course with filtering and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Filter parameters
    const search = searchParams.get('search') || '';
    const minOrder = searchParams.get('minOrder');
    const sortBy = searchParams.get('sortBy') || 'order_asc';

    // Build where clause
    const where = {
      courseId,
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }),
      ...(minOrder && {
        order: {
          gte: parseInt(minOrder)
        }
      })
    };

    // Build orderBy clause
    let orderBy = { order: 'asc' }; // default
    switch (sortBy) {
      case 'order_desc':
        orderBy = { order: 'desc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'created_desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { order: 'asc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.chapter.count({ where });

    // Get chapters with pagination
    const chapters = await prisma.chapter.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: chapters,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        search,
        minOrder,
        sortBy
      }
    });
  } catch (error) {
    console.error('GET /api/admin/chapters error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: /api/admin/chapters - create a new chapter
export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.courseId || !body.title) return NextResponse.json({ success: false, error: 'Missing courseId or title' }, { status: 400 });
    const chapter = await prisma.chapter.create({
      data: {
        title: body.title,
        order: body.order ?? 1,
        courseId: body.courseId,
      },
    });
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
