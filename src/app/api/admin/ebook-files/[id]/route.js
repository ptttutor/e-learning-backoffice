import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteFromVercelBlob } from '@/lib/vercel-blob';

const prisma = new PrismaClient();

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

    // Delete file from Vercel Blob if exists
    if (ebook.fileUrl) {
      try {
        const deleteResult = await deleteFromVercelBlob(ebook.fileUrl);
        if (!deleteResult.success) {
          console.error('Error deleting file from Vercel Blob:', deleteResult.error);
        }
      } catch (blobError) {
        console.error('Error deleting file from Vercel Blob:', blobError);
        // Continue with database update even if Blob deletion fails
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
