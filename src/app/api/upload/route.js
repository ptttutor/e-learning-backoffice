import { NextResponse } from 'next/server';
import {
  uploadToVercelBlob,
  deleteFromVercelBlob,
  generateUniqueFilename,
  validateFile,
  getFolderPath
} from '@/lib/vercel-blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('questionImage');
    const type = formData.get('type') || 'question'; // 'ebook', 'cover', or 'question'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Define allowed file types based on type
    let allowedTypes = [];

    if (type === 'ebook') {
      allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
    } else if (type === 'cover' || type === 'question' || type === 'post-content') {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    }

    // Validate file type only (no size limit)
    const validation = validateFile(file, allowedTypes);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename and get folder path
    const uniqueFilename = generateUniqueFilename(file.name);
    const folder = getFolderPath(type);

    // Upload to Vercel Blob
    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: 'Upload failed: ' + uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      pathname: uploadResult.pathname,
      downloadUrl: uploadResult.downloadUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'File URL is required' },
        { status: 400 }
      );
    }

    const deleteResult = await deleteFromVercelBlob(url);

    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, error: 'Delete failed: ' + deleteResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed: ' + error.message },
      { status: 500 }
    );
  }
}
