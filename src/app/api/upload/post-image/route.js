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
    const isMobile = formData.get('isMobile') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type only (no size limit)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validation = validateFile(file, allowedTypes);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename
    const suffix = isMobile ? '_mobile' : '_desktop';
    const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}${suffix}`;
    
    // Get folder path
    const folder = getFolderPath('post-image');

    // Upload to Vercel Blob
    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      downloadUrl: uploadResult.downloadUrl,
      pathname: uploadResult.pathname,
      filename: file.name,
      size: file.size,
      type: file.type,
      isMobile: isMobile,
      cloudinary_url: uploadResult.url // For backward compatibility
    });

  } catch (error) {
    console.error('Post image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}
