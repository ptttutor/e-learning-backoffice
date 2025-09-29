import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  generateUniqueFilename,
  validateFile,
  getFolderPath,
} from "@/lib/vercel-blob";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

// Cloudflare R2 config (เก็บใน env)
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * อัพโหลดไฟล์ไป R2
 * @param {Blob} file
 * @param {string} filename
 * @param {string} folder
 */
async function uploadToR2(file, filename, folder) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = folder ? `${folder}/${filename}` : filename;

  try {
    // อัปโหลดไป R2 ด้วย S3 client (ต้องมี access key)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // สร้าง public URL จาก Public Development URL
    const url = `${process.env.R2_PUBLIC_DEV_URL}/${key}`;
    return { success: true, url };
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return { success: false, error: error.message };
  }
}

// POST - อัพโหลดไฟล์ข้อสอบ
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const examId = formData.get("examId");

    if (!file || !examId) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์และระบุ ID ข้อสอบ" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อสอบมีอยู่
    const exam = await prisma.examBank.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อสอบที่ระบุ" },
        { status: 404 }
      );
    }

    // ตรวจสอบประเภทไฟล์เท่านั้น
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const validation = validateFile(file, allowedTypes);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // สร้างชื่อไฟล์ใหม่
    const uniqueFilename = generateUniqueFilename(file.name, `exam_${examId}`);
    const folder = getFolderPath("exam");

    // อัพโหลดไป R2
    const uploadResult = await uploadToR2(file, uniqueFilename, folder);
    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถอัปโหลดไฟล์ได้: " + uploadResult.error,
        },
        { status: 500 }
      );
    }

    // บันทึกข้อมูลลง DB
    const examFile = await prisma.examFile.create({
      data: {
        examId,
        fileName: file.name,
        filePath: uploadResult.url,
        fileType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "อัพโหลดไฟล์สำเร็จ",
      data: examFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
      { status: 500 }
    );
  }
}

// GET - ดึงรายการไฟล์ข้อสอบ
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ ID ข้อสอบ" },
        { status: 400 }
      );
    }

    const files = await prisma.examFile.findMany({
      where: { examId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("Error fetching exam files:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์" },
      { status: 500 }
    );
  }
}
