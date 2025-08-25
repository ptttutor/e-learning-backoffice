import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/categories/[id] - ดึงข้อมูลหมวดหมู่เดียว
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            subjects: true,
            articles: true,
            children: true
          }
        }
      }
    });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch category', error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - อัปเดตหมวดหมู่
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update category', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - ลบหมวดหมู่
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete category', error: error.message }, { status: 500 });
  }
}
