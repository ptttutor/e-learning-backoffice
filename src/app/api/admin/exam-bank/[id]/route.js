import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลข้อสอบตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const exam = await prisma.examBank.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        files: {
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

// PUT - อัพเดทข้อสอบ
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, categoryId, isActive } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อข้อสอบ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อสอบมีอยู่หรือไม่
    const existingExam = await prisma.examBank.findUnique({
      where: { id }
    });

    if (!existingExam) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อสอบ' },
        { status: 404 }
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

    const updatedExam = await prisma.examBank.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        ...(isActive !== undefined && { isActive })
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
      message: 'อัพเดทข้อสอบสำเร็จ',
      data: updatedExam
    });

  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพเดทข้อสอบ' },
      { status: 500 }
    );
  }
}

// DELETE - ลบข้อสอบ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ตรวจสอบว่าข้อสอบมีอยู่หรือไม่
    const exam = await prisma.examBank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อสอบ' },
        { status: 404 }
      );
    }

    // ลบข้อสอบ (ไฟล์จะถูกลบอัตโนมัติเนื่องจาก onDelete: Cascade)
    await prisma.examBank.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'ลบข้อสอบสำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบข้อสอบ' },
      { status: 500 }
    );
  }
}