import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ PDF, Word, รูปภาพ)' },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'ขนาดไฟล์เกิน 10MB' },
        { status: 400 }
      );
    }

    // สร้างชื่อไฟล์ใหม่
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const newFileName = `${examId}_${timestamp}.${extension}`;

    // สร้างโฟลเดอร์สำหรับเก็บไฟล์
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'exams');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // บันทึกไฟล์
    const filePath = join(uploadDir, newFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // บันทึกข้อมูลไฟล์ในฐานข้อมูล
    const examFile = await prisma.examFile.create({
      data: {
        examId,
        fileName: originalName,
        filePath: `/uploads/exams/${newFileName}`,
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
    console.error('Error uploading exam file:', error);
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