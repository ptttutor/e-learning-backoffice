import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการหมวดหมู่ข้อสอบทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';

    const where = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      })
    };

    const categories = await prisma.examCategory.findMany({
      where,
      include: {
        _count: {
          select: { exams: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.examCategory.count({ where });

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching exam categories:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}

// POST - สร้างหมวดหมู่ข้อสอบใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อหมวดหมู่' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าชื่อหมวดหมู่ซ้ำหรือไม่
    const existingCategory = await prisma.examCategory.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    const category = await prisma.examCategory.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างหมวดหมู่ข้อสอบสำเร็จ',
      data: category
    });

  } catch (error) {
    console.error('Error creating exam category:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}