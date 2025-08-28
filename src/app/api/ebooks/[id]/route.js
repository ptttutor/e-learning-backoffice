import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล ebook ตาม ID สำหรับลูกค้า
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const ebook = await prisma.ebook.findUnique({
      where: { 
        id: id,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          where: {
            isActive: true
          },
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!ebook) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    // คำนวณ average rating
    const averageRating = ebook.reviews.length > 0 
      ? ebook.reviews.reduce((sum, review) => sum + review.rating, 0) / ebook.reviews.length
      : 0;

    // ซ่อนข้อมูลที่ไม่ควรแสดงให้ลูกค้า
    const publicEbook = {
      ...ebook,
      averageRating,
      fileUrl: undefined // ซ่อนลิงก์ดาวน์โหลดจริง
    };

    return NextResponse.json({
      success: true,
      data: publicEbook
    });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ebook' },
      { status: 500 }
    );
  }
}