import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการข้อสอบทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const where = {
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }),
      ...(categoryId && { categoryId })
    };

    const exams = await prisma.examBank.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true
          }
        },
        _count: {
          select: { files: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.examBank.count({ where });

    return NextResponse.json({
      success: true,
      data: exams,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อสอบ' },
      { status: 500 }
    );
  }
}

// POST - สร้างข้อสอบใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, categoryId } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อข้อสอบ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่ (ถ้าระบุ)
    if (categoryId) {
      const category = await prisma.examCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบหมวดหมู่ที่ระบุ' },
          { status: 400 }
        );
      }
    }

    const exam = await prisma.examBank.create({
      data: {
        title,
        description,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างข้อสอบสำเร็จ',
      data: exam
    });

  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}