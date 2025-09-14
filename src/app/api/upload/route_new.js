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

    // Validate file with Vercel Blob constraints
    const validation = validateFile(file, type);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Upload to Vercel Blob
    const folderPath = getFolderPath(type);
    const uploadResult = await uploadToVercelBlob(buffer, uniqueFilename, folderPath);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: uniqueFilename,
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

    const result = await deleteFromVercelBlob(url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}
