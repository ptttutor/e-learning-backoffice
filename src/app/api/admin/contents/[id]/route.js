import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/contents/[id] - get a single content
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: /api/admin/contents/[id] - update a content
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const content = await prisma.content.update({
      where: { id },
      data: {
        title: body.title,
        contentType: body.contentType,
        contentUrl: body.contentUrl,
        order: body.order,
      },
    });
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: /api/admin/contents/[id] - delete a content
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
