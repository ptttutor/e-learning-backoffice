import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/users?role=INSTRUCTOR
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
