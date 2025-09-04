import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการหมวดหมู่ ebook ทั้งหมด
export async function GET() {
  try {
    const categories = await prisma.ebookCategory.findMany({
      include: {
        _count: {
          select: {
            ebooks: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching ebook categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebook categories' },
      { status: 500 }
    );
  }
}

// POST - สร้างหมวดหมู่ ebook ใหม่
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const category = await prisma.ebookCategory.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating ebook category:', error);
    
    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create ebook category' },
      { status: 500 }
    );
  }
}