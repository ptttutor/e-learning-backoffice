import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลหมวดหมู่ข้อสอบตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const category = await prisma.examCategory.findUnique({
      where: { id },
      include: {
        exams: {
          include: {
            _count: {
              select: { files: true }
            }
          }
        },
        _count: {
          select: { exams: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบหมวดหมู่ข้อสอบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching exam category:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}

// PUT - อัพเดทหมวดหมู่ข้อสอบ
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อหมวดหมู่' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const existingCategory = await prisma.examCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบหมวดหมู่ข้อสอบ' },
        { status: 404 }
      );
    }

    // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
    const duplicateCategory = await prisma.examCategory.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.examCategory.update({
      where: { id },
      data: {
        name,
        description,
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'อัพเดทหมวดหมู่ข้อสอบสำเร็จ',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error updating exam category:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}

// DELETE - ลบหมวดหมู่ข้อสอบ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const category = await prisma.examCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { exams: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบหมวดหมู่ข้อสอบ' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อสอบในหมวดหมู่นี้หรือไม่
    if (category._count.exams > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบหมวดหมู่ที่มีข้อสอบอยู่ได้' },
        { status: 400 }
      );
    }

    await prisma.examCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'ลบหมวดหมู่ข้อสอบสำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting exam category:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบหมวดหมู่ข้อสอบ' },
      { status: 500 }
    );
  }
}