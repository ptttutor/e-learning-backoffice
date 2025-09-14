import { NextResponse } from 'next/server';
import {
  uploadToVercelBlob,
  generateUniqueFilename,
  validateFile,
  getFolderPath,
  isImageFile,
  isPdfFile
} from '@/lib/vercel-blob';

export async function POST(request) {
  try {
    console.log('🚀 Starting file upload process...');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'general'; // 'cover', 'ebook', 'exam', 'payment-slip', etc.

    console.log('📋 Upload request:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'Unknown',
      fileType: file?.type,
      uploadType: type
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Define allowed file types based on upload type
    const allowedTypes = getAllowedTypes(type);
    const maxSize = getMaxFileSize(type);

    console.log('🔍 Validation config:', {
      allowedTypes,
      maxSizeMB: (maxSize / 1024 / 1024).toFixed(1)
    });

    // Validate file
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      console.error('❌ File validation failed:', validation.errors);
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Get appropriate folder
    const folder = getFolderPath(type);

    console.log('☁️ Uploading to Vercel Blob:', { uniqueFilename, folder });

    // Upload to Vercel Blob with compression for images
    const uploadResult = await uploadToVercelBlob(file, uniqueFilename, folder, true);

    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error);
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    console.log('✅ Upload successful:', {
      url: uploadResult.url,
      originalSize: uploadResult.originalSize,
      finalSize: uploadResult.compressedSize,
      compressed: uploadResult.compressed
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        downloadUrl: uploadResult.downloadUrl,
        pathname: uploadResult.pathname,
        filename: file.name,
        uniqueFilename: uniqueFilename,
        size: uploadResult.compressedSize || uploadResult.size,
        originalSize: uploadResult.originalSize,
        type: file.type,
        folder: folder,
        compressed: uploadResult.compressed || false,
      }
    });

  } catch (error) {
    console.error('❌ Vercel Blob upload error:', error);
    
    // Detailed error logging
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    
    console.error('📋 Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Get allowed file types based on upload type
 * @param {string} type - Upload type
 * @returns {Array} Array of allowed MIME types
 */
function getAllowedTypes(type) {
  const typeConfig = {
    'cover': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'ebook': ['application/pdf', 'application/epub+zip'],
    'exam': ['application/pdf'],
    'payment-slip': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'post-image': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'question-image': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'general': [], // Allow all types
  };

  return typeConfig[type] || [];
}

/**
 * Get maximum file size based on upload type
 * @param {string} type - Upload type
 * @returns {number} Maximum file size in bytes
 */
function getMaxFileSize(type) {
  const sizeConfig = {
    'cover': 15 * 1024 * 1024, // 15MB
    'ebook': 50 * 1024 * 1024, // 50MB
    'exam': 50 * 1024 * 1024, // 50MB
    'payment-slip': 15 * 1024 * 1024, // 15MB
    'post-image': 15 * 1024 * 1024, // 15MB
    'question-image': 15 * 1024 * 1024, // 15MB
    'general': 15 * 1024 * 1024, // 15MB
  };

  return sizeConfig[type] || 15 * 1024 * 1024; // Default 15MB
}