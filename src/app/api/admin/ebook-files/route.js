import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  uploadToVercelBlob,
  generateUniqueFilename,
  validateFile,
  getFolderPath
} from '@/lib/vercel-blob';

const prisma = new PrismaClient();

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

    // Validate file type only (no size limit)
    const allowedTypes = ['application/pdf', 'application/epub+zip'];
    
    const validation = validateFile(file, allowedTypes);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename and upload to Vercel Blob
    const uniqueFilename = generateUniqueFilename(file.name, `ebook_${ebookId}`);
    const folder = getFolderPath('ebook');

    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload file: ' + uploadResult.error },
        { status: 500 }
      );
    }

    // Update ebook with file URL and metadata
    const updatedEbook = await prisma.ebook.update({
      where: { id: ebookId },
      data: {
        fileUrl: uploadResult.url,
        fileSize: file.size,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        fileUrl: uploadResult.url,
        downloadUrl: uploadResult.downloadUrl,
        fileSize: file.size,
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
