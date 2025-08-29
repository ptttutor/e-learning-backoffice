import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/courses/[id] - get a single course
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        category: true,
        chapters: true,
        enrollments: true,
      },
    });
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: /api/admin/courses/[id] - update a course
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        duration: body.duration,
        isFree: body.isFree,
        status: body.status,
        instructorId: body.instructorId,
        categoryId: body.categoryId,
        coverImageUrl: body.coverImageUrl,
        coverPublicId: body.coverPublicId,
      },
    });
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: /api/admin/courses/[id] - delete a course
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
