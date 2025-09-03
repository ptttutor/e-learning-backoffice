import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/contents?chapterId=... - list all contents for a chapter with filtering and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');
    if (!chapterId) return NextResponse.json({ success: false, error: 'Missing chapterId' }, { status: 400 });

    // Extract query parameters for filtering and pagination
    const search = searchParams.get('search') || '';
    const contentType = searchParams.get('contentType') || '';
    const sortBy = searchParams.get('sortBy') || 'order_asc';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;

    // Build where clause
    const where = {
      chapterId,
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }),
      ...(contentType && {
        contentType: contentType
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
      case 'type_asc':
        orderBy = { contentType: 'asc' };
        break;
      case 'type_desc':
        orderBy = { contentType: 'desc' };
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

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await prisma.content.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get filtered and paginated contents
    const contents = await prisma.content.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
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
      data: contents,
      pagination,
      filters: {
        search,
        contentType,
        sortBy
      }
    });
  } catch (error) {
    console.error('GET /api/admin/contents error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: /api/admin/contents - create a new content
export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.chapterId || !body.title || !body.contentType || !body.contentUrl) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    const content = await prisma.content.create({
      data: {
        title: body.title,
        contentType: body.contentType,
        contentUrl: body.contentUrl,
        order: body.order ?? 1,
        chapterId: body.chapterId,
      },
    });
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
