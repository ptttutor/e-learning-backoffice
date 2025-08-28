import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/courses - get published courses for public
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED' // Only show published courses to public
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส' },
      { status: 500 }
    );
  }
}