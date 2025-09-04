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

    // ลบไฟล์จาก Cloudinary
    try {
      // เลือก method ของการลบตาม URL
      if (examFile.filePath.includes('cloudinary.com')) {
        // ดึง public_id จาก URL
        const urlParts = examFile.filePath.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        const fullPublicId = `exams/${publicId}`;
        
        console.log('🔍 Attempting to delete from Cloudinary:', fullPublicId);
        
        await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'raw' });
        console.log('✅ Cloudinary file deleted successfully');
      } else {
        console.log('⚠️ File appears to be local, skipping Cloudinary deletion');
      }
    } catch (cloudError) {
      console.log('⚠️ Error deleting from Cloudinary:', cloudError.message);
      // Continue with database deletion even if Cloudinary deletion fails
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