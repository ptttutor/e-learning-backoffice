import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload ebook file
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const ebookId = formData.get('ebookId');

    if (!file || !ebookId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or ebook ID' },
        { status: 400 }
      );
    }

    // Verify ebook exists
    const ebook = await prisma.ebook.findUnique({
      where: { id: ebookId }
    });

    if (!ebook) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // สำคัญ: ต้องเป็น 'raw' เพื่อให้ Google Drive Viewer เปิดได้
          folder: 'ebooks',
          public_id: `${ebookId}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Update ebook with file URL and metadata
    const updatedEbook = await prisma.ebook.update({
      where: { id: ebookId },
      data: {
        fileUrl: uploadResult.secure_url,
        fileSize: uploadResult.bytes,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        fileUrl: uploadResult.secure_url,
        fileSize: uploadResult.bytes,
        ebook: updatedEbook
      }
    });

  } catch (error) {
    console.error('Error uploading ebook file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
