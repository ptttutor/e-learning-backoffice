import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// DELETE - ลบไฟล์ข้อสอบ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    const examFile = await prisma.examFile.findUnique({
      where: { id }
    });

    if (!examFile) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์ที่ระบุ' },
        { status: 404 }
      );
    }

    // ลบไฟล์จากระบบไฟล์
    const fullPath = join(process.cwd(), 'public', examFile.filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    // ลบข้อมูลไฟล์จากฐานข้อมูล
    await prisma.examFile.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'ลบไฟล์สำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting exam file:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  }
}

// GET - ดาวน์โหลดไฟล์ข้อสอบ
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    const examFile = await prisma.examFile.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            title: true
          }
        }
      }
    });

    if (!examFile) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์ที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าไฟล์มีอยู่ในระบบไฟล์หรือไม่
    const fullPath = join(process.cwd(), 'public', examFile.filePath);
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์ในระบบ' },
        { status: 404 }
      );
    }

    // ส่งข้อมูลไฟล์สำหรับดาวน์โหลด
    return NextResponse.json({
      success: true,
      data: {
        id: examFile.id,
        fileName: examFile.fileName,
        filePath: examFile.filePath,
        fileType: examFile.fileType,
        fileSize: examFile.fileSize,
        examTitle: examFile.exam.title,
        downloadUrl: examFile.filePath
      }
    });

  } catch (error) {
    console.error('Error getting exam file:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์' },
      { status: 500 }
    );
  }
}