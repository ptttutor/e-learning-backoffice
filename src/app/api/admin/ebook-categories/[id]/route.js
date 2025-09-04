import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลหมวดหมู่ ebook ตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const category = await prisma.ebookCategory.findUnique({
      where: { id: id }, // ใช้ String ID
      include: {
        ebooks: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            isActive: true
          }
        },
        _count: {
          select: {
            ebooks: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - อัปเดตหมวดหมู่ ebook
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const category = await prisma.ebookCategory.update({
      where: { id: id }, // ใช้ String ID
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - ลบหมวดหมู่ ebook
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // ตรวจสอบว่ามี ebooks ที่เชื่อมโยงอยู่หรือไม่
    const ebookCount = await prisma.ebook.count({
      where: { categoryId: id } // ใช้ String ID
    });

    if (ebookCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has ebooks' },
        { status: 400 }
      );
    }

    await prisma.ebookCategory.delete({
      where: { id: id } // ใช้ String ID
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}