import { put, del, list } from '@vercel/blob';

/**
 * Upload file to Vercel Blob
 * @param {File|Buffer} file - File to upload
 * @param {string} filename - File name
 * @param {string} folder - Folder path (optional)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToVercelBlob(file, filename, folder = '') {
  try {
    let buffer;
    
    // Convert file to buffer if it's a File object
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      throw new Error('Unsupported file type');
    }

    // Create full path with folder
    const pathname = folder ? `${folder}/${filename}` : filename;

    // Upload to Vercel Blob
    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      downloadUrl: blob.downloadUrl,
    };
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete file from Vercel Blob
 * @param {string} url - File URL to delete
 * @returns {Promise<Object>} Delete result
 */
export async function deleteFromVercelBlob(url) {
  try {
    await del(url);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    console.error('Vercel Blob delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List files in Vercel Blob
 * @param {string} prefix - Prefix to filter files (optional)
 * @param {number} limit - Number of files to return (optional)
 * @returns {Promise<Object>} List result
 */
export async function listVercelBlobFiles(prefix = '', limit = 1000) {
  try {
    const { blobs } = await list({
      prefix,
      limit,
    });

    return {
      success: true,
      files: blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        downloadUrl: blob.downloadUrl,
      })),
    };
  } catch (error) {
    console.error('Vercel Blob list error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} prefix - Prefix for filename (optional)
 * @returns {string} Unique filename
 */
export function generateUniqueFilename(originalName, prefix = '') {
  const timestamp = Date.now();
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return prefix ? `${prefix}_${timestamp}_${cleanName}` : `${timestamp}_${cleanName}`;
}

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
export function validateFile(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
  const errors = [];

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File too large. Maximum size is ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is an image
 */
export function isImageFile(mimeType) {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is a PDF
 */
export function isPdfFile(mimeType) {
  return mimeType === 'application/pdf';
}

/**
 * Get appropriate folder based on file type
 * @param {string} type - File type ('cover', 'ebook', 'exam', 'payment-slip', etc.)
 * @returns {string} Folder path
 */
export function getFolderPath(type) {
  const folders = {
    'cover': 'covers',
    'ebook': 'ebooks',
    'exam': 'exams',
    'payment-slip': 'payment-slips',
    'post-image': 'posts',
    'question-image': 'questions',
    'general': 'uploads',
  };

  return folders[type] || 'uploads';
}