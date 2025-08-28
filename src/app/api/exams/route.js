import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการข้อสอบสำหรับหน้าสาธารณะ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const where = {
      isActive: true,
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