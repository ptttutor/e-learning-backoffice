import { NextResponse } from 'next/server';
import {
  uploadToVercelBlob,
  generateUniqueFilename,
  validateFile,
  getFolderPath
} from '@/lib/vercel-blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general'; // Optional folder parameter
    const width = formData.get('width') || 800; // Optional width parameter (not used in Vercel Blob)
    const height = formData.get('height') || 600; // Optional height parameter (not used in Vercel Blob)

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type only (no size limit)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    const validation = validateFile(file, allowedTypes);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename and get folder path
    const uniqueFilename = generateUniqueFilename(file.name);
    const folderPath = folder === 'general' ? 'uploads' : folder;

    // Upload to Vercel Blob
    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folderPath);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: 'Upload failed: ' + uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        pathname: uploadResult.pathname,
        downloadUrl: uploadResult.downloadUrl,
        filename: file.name,
        size: file.size,
        format: file.type,
        folder: folderPath
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload image' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE method for removing images
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Import deleteFromVercelBlob dynamically
    const { deleteFromVercelBlob } = await import('@/lib/vercel-blob');
    const deleteResult = await deleteFromVercelBlob(url);

    if (deleteResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image: ' + deleteResult.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image: ' + error.message },
      { status: 500 }
    );
  }
}
