import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการหมวดหมู่ข้อสอบสำหรับหน้าสาธารณะ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeExams = searchParams.get('includeExams') === 'true';

    const categories = await prisma.examCategory.findMany({
      where: { isActive: true },
      include: {
        ...(includeExams && {
          exams: {
            where: { isActive: true },
            include: {
              _count: {
                select: { files: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }),
        _count: {
          select: { 
            exams: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching exam categories:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}