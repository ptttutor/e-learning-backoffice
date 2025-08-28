import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการ ebooks ทั้งหมด
export async function GET() {
  try {
    const ebooks = await prisma.ebook.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(ebooks);
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