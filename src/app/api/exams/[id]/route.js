import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลข้อสอบตาม ID สำหรับหน้าสาธารณะ
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const exam = await prisma.examBank.findUnique({
      where: { 
        id,
        isActive: true
      },
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
            filePath: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อสอบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อสอบ' },
      { status: 500 }
    );
  }
}