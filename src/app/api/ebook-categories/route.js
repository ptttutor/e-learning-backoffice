import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการหมวดหมู่ ebook สำหรับลูกค้า
export async function GET() {
  try {
    const categories = await prisma.ebookCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            ebooks: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching ebook categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}