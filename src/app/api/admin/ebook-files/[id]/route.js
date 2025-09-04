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

// DELETE - Remove ebook file
export async function DELETE(request, { params }) {
  try {
    const ebookId = (await params).id;

    if (!ebookId) {
      return NextResponse.json(
        { success: false, error: 'Missing ebook ID' },
        { status: 400 }
      );
    }

    // Get current ebook to find the file URL
    const ebook = await prisma.ebook.findUnique({
      where: { id: ebookId }
    });

    if (!ebook) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    // Delete file from Cloudinary if exists
    if (ebook.fileUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = ebook.fileUrl.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `ebooks/${fileWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Update ebook to remove file URL and size
    const updatedEbook = await prisma.ebook.update({
      where: { id: ebookId },
      data: {
        fileUrl: null,
        fileSize: null,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEbook
    });

  } catch (error) {
    console.error('Error deleting ebook file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}
