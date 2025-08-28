import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลหมวดหมู่ ebook ตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const category = await prisma.ebookCategory.findUnique({
      where: { id: parseInt(id) },
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
    
    const category = await prisma.ebookCategory.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        isActive: data.isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
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
      where: { categoryId: parseInt(id) }
    });

    if (ebookCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has ebooks' },
        { status: 400 }
      );
    }

    await prisma.ebookCategory.delete({
      where: { id: parseInt(id) }
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