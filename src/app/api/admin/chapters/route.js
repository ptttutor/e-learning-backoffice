import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/chapters?courseId=... - list all chapters for a course
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: chapters });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: /api/admin/chapters - create a new chapter
export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.courseId || !body.title) return NextResponse.json({ success: false, error: 'Missing courseId or title' }, { status: 400 });
    const chapter = await prisma.chapter.create({
      data: {
        title: body.title,
        order: body.order ?? 1,
        courseId: body.courseId,
      },
    });
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
