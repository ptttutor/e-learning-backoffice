import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/contents?chapterId=... - list all contents for a chapter
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');
    if (!chapterId) return NextResponse.json({ success: false, error: 'Missing chapterId' }, { status: 400 });
    const contents = await prisma.content.findMany({
      where: { chapterId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: contents });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: /api/admin/contents - create a new content
export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.chapterId || !body.title || !body.contentType || !body.contentUrl) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    const content = await prisma.content.create({
      data: {
        title: body.title,
        contentType: body.contentType,
        contentUrl: body.contentUrl,
        order: body.order ?? 1,
        chapterId: body.chapterId,
      },
    });
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
