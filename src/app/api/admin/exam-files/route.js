import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// ตั้งค่า Cloudinary จาก ENV
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const fileExtension = file.name.split('.').pop();
    const filename = `${examId}_${timestamp}.${fileExtension}`;

    // แปลงไฟล์เป็น buffer และสร้าง data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // สร้าง data URL จาก buffer
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // อัพโหลดไปยัง Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "exams",
      use_filename: true,
      unique_filename: false,
      public_id: `${examId}_${timestamp}`,
      resource_type: 'raw' // สำหรับไฟล์ที่ไม่ใช่รูปภาพ
    });

    // บันทึกข้อมูลลงฐานข้อมูล
    const examFile = await prisma.examFile.create({
      data: {
        examId: examId,
        fileName: file.name,
        filePath: uploadResult.secure_url, // URL จาก Cloudinary
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