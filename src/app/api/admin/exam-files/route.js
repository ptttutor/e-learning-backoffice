import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  uploadToVercelBlob,
  generateUniqueFilename,
  validateFile,
  getFolderPath
} from '@/lib/vercel-blob';

const prisma = new PrismaClient();

// POST - อัพโหลดไฟล์ข้อสอบ
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const examId = formData.get('examId');

    if (!file || !examId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์และระบุ ID ข้อสอบ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อสอบมีอยู่หรือไม่
    const exam = await prisma.examBank.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อสอบที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบประเภทไฟล์และขนาด
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 50 * 1024 * 1024; // 50MB สำหรับไฟล์ข้อสอบ
    
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // สร้างชื่อไฟล์ใหม่
    const uniqueFilename = generateUniqueFilename(file.name, `exam_${examId}`);
    const folder = getFolderPath('exam');

    // อัพโหลดไปยัง Vercel Blob
    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถอัปโหลดไฟล์ได้: ' + uploadResult.error },
        { status: 500 }
      );
    }

    // บันทึกข้อมูลลงฐานข้อมูล
    const examFile = await prisma.examFile.create({
      data: {
        examId: examId,
        fileName: file.name,
        filePath: uploadResult.url, // URL จาก Vercel Blob
        fileType: file.type,
        fileSize: file.size
      }
    });

    return NextResponse.json({
      success: true,
      message: 'อัพโหลดไฟล์สำเร็จ',
      data: examFile
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์' },
      { status: 500 }
    );
  }
}

// GET - ดึงรายการไฟล์ข้อสอบ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID ข้อสอบ' },
        { status: 400 }
      );
    }

    const files = await prisma.examFile.findMany({
      where: { examId },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Error fetching exam files:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์' },
      { status: 500 }
    );
  }
}