import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการ ebooks ทั้งหมด พร้อม filtering และ pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const skip = (page - 1) * pageSize;

    // Get filter parameters
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || 'ALL';
    const format = searchParams.get('format') || '';
    const featured = searchParams.get('featured') || 'ALL';
    const physical = searchParams.get('physical') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Status filter
    if (status !== 'ALL') {
      where.isActive = status === 'ACTIVE';
    }

    // Format filter
    if (format) {
      where.format = format;
    }

    // Featured filter
    if (featured !== 'ALL') {
      where.isFeatured = featured === 'FEATURED';
    }

    // Physical filter
    if (physical !== 'ALL') {
      where.isPhysical = physical === 'PHYSICAL';
    }

    // Build orderBy clause
    const orderBy = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'author') {
      orderBy.author = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get total count for pagination
    const totalCount = await prisma.ebook.count({ where });

    // Get ebooks with filters
    const ebooks = await prisma.ebook.findMany({
      where,
      include: {
        category: true
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: ebooks,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebooks', details: error.message },
      { status: 500 }
    );
  }
}

// POST - สร้าง ebook ใหม่
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);
    
    // Validate required fields
    if (!data.title || !data.author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const ebookData = {
      title: data.title,
      author: data.author,
      price: parseFloat(data.price) || 0,
      language: data.language || 'th',
      format: data.format || 'PDF',
      isPhysical: Boolean(data.isPhysical),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isFeatured: Boolean(data.isFeatured)
    };

    // Add optional fields only if they have values
    if (data.description) ebookData.description = data.description;
    if (data.isbn) ebookData.isbn = data.isbn;
    if (data.discountPrice) ebookData.discountPrice = parseFloat(data.discountPrice);
    if (data.coverImageUrl) ebookData.coverImageUrl = data.coverImageUrl;
    if (data.previewUrl) ebookData.previewUrl = data.previewUrl;
    if (data.fileUrl) ebookData.fileUrl = data.fileUrl;
    if (data.fileSize) ebookData.fileSize = parseInt(data.fileSize);
    if (data.pageCount) ebookData.pageCount = parseInt(data.pageCount);
    if (data.publishedYear) ebookData.publishedYear = parseInt(data.publishedYear);
    if (data.weight) ebookData.weight = parseFloat(data.weight);
    if (data.dimensions) ebookData.dimensions = data.dimensions;
    if (data.categoryId) ebookData.categoryId = data.categoryId;
    if (data.publishedAt) ebookData.publishedAt = new Date(data.publishedAt);

    console.log('Creating ebook with data:', ebookData);
    
    const ebook = await prisma.ebook.create({
      data: ebookData,
      include: {
        category: true
      }
    });

    return NextResponse.json(ebook, { status: 201 });
  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to create ebook', details: error.message },
      { status: 500 }
    );
  }
}