// PATCH - อัปเดต isDownload
export async function PATCH(request, { params }) {
  const prisma = new PrismaClient();
  try {
    const { id } = params;
    const body = await request.json();
    const { isDownload } = body;
    if (typeof isDownload !== "boolean") {
      return NextResponse.json({ success: false, error: "isDownload ต้องเป็น boolean" }, { status: 400 });
    }
    const updated = await prisma.examFile.update({
      where: { id },
      data: { isDownload },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFromVercelBlob } from '@/lib/vercel-blob';

const prisma = new PrismaClient();

// DELETE - ลบไฟล์ข้อสอบ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    console.log('🗑️ DELETE request for file ID:', id);

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    const examFile = await prisma.examFile.findUnique({
      where: { id }
    });

    if (!examFile) {
      console.log('❌ File not found:', id);
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์ที่ระบุ' },
        { status: 404 }
      );
    }

    console.log('📄 Found file to delete:', examFile.fileName);

    // ลบไฟล์จาก Vercel Blob
    try {
      if (examFile.filePath) {
        console.log('🔍 Attempting to delete from Vercel Blob:', examFile.filePath);
        
        const deleteResult = await deleteFromVercelBlob(examFile.filePath);
        if (deleteResult.success) {
          console.log('✅ Vercel Blob file deleted successfully');
        } else {
          console.log('⚠️ Error deleting from Vercel Blob:', deleteResult.error);
        }
      }
    } catch (blobError) {
      console.log('⚠️ Error deleting from Vercel Blob:', blobError.message);
      // Continue with database deletion even if Blob deletion fails
    }

    // ลบข้อมูลไฟล์จากฐานข้อมูล
    await prisma.examFile.delete({
      where: { id }
    });

    console.log('✅ File deleted from database successfully');

    return NextResponse.json({
      success: true,
      message: 'ลบไฟล์สำเร็จ'
    });

  } catch (error) {
    console.error('❌ Error deleting exam file:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบไฟล์: ' + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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