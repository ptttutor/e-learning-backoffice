import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { examId, fileName, filePath, fileType, fileSize } = body;

    console.log("Save file request:", { examId, fileName, filePath, fileType, fileSize });

    if (!examId || !fileName || !filePath) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน (examId, fileName, filePath)" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อสอบมีอยู่
    const exam = await prisma.examBank.findUnique({ 
      where: { id: examId } 
    });
    
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อสอบที่ระบุ" },
        { status: 404 }
      );
    }

    // บันทึกข้อมูลลง DB
    const examFile = await prisma.examFile.create({
      data: {
        examId,
        fileName,
        filePath,
        fileType: fileType || "application/octet-stream",
        fileSize: parseInt(fileSize) || 0,
      },
    });

    console.log("File saved successfully:", examFile.id);

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลไฟล์สำเร็จ",
      data: examFile,
    });
  } catch (error) {
    console.error("Error saving file info:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}