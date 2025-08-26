import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/chapters/[id] - get a single chapter
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) return NextResponse.json({ success: false, error: 'Chapter not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: /api/admin/chapters/[id] - update a chapter
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title: body.title,
        order: body.order,
      },
    });
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: /api/admin/chapters/[id] - delete a chapter
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await prisma.chapter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
