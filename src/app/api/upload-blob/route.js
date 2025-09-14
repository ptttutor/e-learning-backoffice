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
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'general'; // 'cover', 'ebook', 'exam', 'payment-slip', etc.

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Define allowed file types based on upload type
    const allowedTypes = getAllowedTypes(type);
    const maxSize = getMaxFileSize(type);

    // Validate file
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Get appropriate folder
    const folder = getFolderPath(type);

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
      data: {
        url: uploadResult.url,
        downloadUrl: uploadResult.downloadUrl,
        pathname: uploadResult.pathname,
        filename: file.name,
        uniqueFilename: uniqueFilename,
        size: file.size,
        type: file.type,
        folder: folder,
      }
    });

  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
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
    'cover': 5 * 1024 * 1024, // 5MB
    'ebook': 50 * 1024 * 1024, // 50MB
    'exam': 50 * 1024 * 1024, // 50MB
    'payment-slip': 5 * 1024 * 1024, // 5MB
    'post-image': 5 * 1024 * 1024, // 5MB
    'question-image': 2 * 1024 * 1024, // 2MB
    'general': 10 * 1024 * 1024, // 10MB
  };

  return sizeConfig[type] || 10 * 1024 * 1024; // Default 10MB
}