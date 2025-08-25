import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/course-chapters/[id] - ดึงข้อมูล chapter เดียว
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const chapter = await prisma.courseChapter.findUnique({
      where: { id: id },
      include: {
        course: { select: { id: true, title: true } },
        lessons: true,
        _count: { select: { lessons: true } }
      }
    });
    if (!chapter) {
      return NextResponse.json({ success: false, message: 'Chapter not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch chapter', error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/course-chapters/[id] - อัปเดต chapter
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const chapter = await prisma.courseChapter.update({
      where: { id: id },
      data: body,
    });
    return NextResponse.json({ success: true, message: 'Chapter updated successfully', data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update chapter', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/course-chapters/[id] - ลบ chapter
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.courseChapter.delete({ where: { id: id } });
    return NextResponse.json({ success: true, message: 'Chapter deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete chapter', error: error.message }, { status: 500 });
  }
}
