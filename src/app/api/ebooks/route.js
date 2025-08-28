import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการ ebooks สำหรับลูกค้า
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const format = searchParams.get('format');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // สร้าง where condition
    const where = {
      isActive: true
    };

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (format) {
      where.format = format;
    }

    // ดึงข้อมูล ebooks
    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.ebook.count({ where })
    ]);

    // คำนวณ average rating และเพิ่มข้อมูลที่จำเป็น
    const ebooksWithRating = ebooks.map(ebook => ({
      ...ebook,
      averageRating: ebook.reviews.length > 0 
        ? ebook.reviews.reduce((sum, review) => sum + review.rating, 0) / ebook.reviews.length
        : 0,
      _count: {
        reviews: ebook.reviews.length
      },
      // ซ่อนข้อมูลที่ไม่ควรแสดงให้ลูกค้า
      fileUrl: undefined,
      previewUrl: ebook.previewUrl // เฉพาะ preview เท่านั้น
    }));

    return NextResponse.json({
      success: true,
      data: ebooksWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    console.error('Error details:', error.message);
    console.error('Search params:', { category, featured, search, format, page, limit });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ebooks', details: error.message },
      { status: 500 }
    );
  }
}