import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/subjects/[id] - ดึงข้อมูลวิชาเดียว
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const subject = await prisma.subject.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        _count: {
          select: {
            courses: true,
            examSets: true
          }
        }
      }
    });
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subject', error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/subjects/[id] - อัปเดตวิชา
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const subject = await prisma.subject.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json({ success: true, message: 'Subject updated successfully', data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update subject', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/subjects/[id] - ลบวิชา
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.subject.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete subject', error: error.message }, { status: 500 });
  }
}
