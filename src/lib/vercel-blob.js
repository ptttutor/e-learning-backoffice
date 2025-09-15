import { put, del, list } from '@vercel/blob';

/**
 * Compress image if it's too large
 * @param {File} file - Original image file
 * @param {number} maxSizeBytes - Maximum file size in bytes
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Compressed file or original if not needed
 */
async function compressImageIfNeeded(file, maxSizeBytes = 2 * 1024 * 1024, quality = 0.8) {
  // Get settings from environment or use defaults
  const compressionQuality = parseFloat(process.env.UPLOAD_COMPRESSION_QUALITY || '0.8');
  const maxWidth = parseInt(process.env.UPLOAD_MAX_WIDTH || '1920');
  const maxHeight = parseInt(process.env.UPLOAD_MAX_HEIGHT || '1080');
  
  // Only compress if file is an image and larger than max size
  if (!file.type.startsWith('image/') || file.size <= maxSizeBytes) {
    return file;
  }

  try {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality || compressionQuality
        );
      };

      img.onerror = () => {
        // If compression fails, return original file
        resolve(file);
      };

      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

/**
 * Upload file to Vercel Blob
 * @param {File|Buffer} file - File to upload
 * @param {string} filename - File name
 * @param {string} folder - Folder path (optional)
 * @param {boolean} compressImage - Whether to compress images (default: true)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToVercelBlob(file, filename, folder = '', compressImage = true) {
  try {
    let processedFile = file;
    
    // Compress image if it's a browser File object and compression is enabled
    if (compressImage && typeof window !== 'undefined' && file instanceof File && file.type.startsWith('image/')) {
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      processedFile = await compressImageIfNeeded(file);
      console.log('Processed file size:', (processedFile.size / 1024 / 1024).toFixed(2), 'MB');
    }

    let buffer;
    
    // Convert file to buffer
    if (processedFile instanceof File) {
      const arrayBuffer = await processedFile.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    } else if (Buffer.isBuffer(processedFile)) {
      buffer = processedFile;
    } else {
      throw new Error('Unsupported file type');
    }

    // Create full path with folder
    const pathname = folder ? `${folder}/${filename}` : filename;

    console.log('Uploading to Vercel Blob:', pathname, 'Size:', buffer.length);

    // Upload to Vercel Blob with timeout
    const uploadPromise = put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Add timeout to prevent hanging
    const timeoutMs = parseInt(process.env.UPLOAD_TIMEOUT || '60000'); // Default 60 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs/1000} seconds`)), timeoutMs);
    });

    const blob = await Promise.race([uploadPromise, timeoutPromise]);

    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      downloadUrl: blob.downloadUrl,
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressed: file.size !== processedFile.size,
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
export function validateFile(file, allowedTypes = [], maxSize = null) {
  const errors = [];

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size only if maxSize is specified
  if (maxSize !== null && file.size > maxSize) {
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
    'post-content': 'post-content',
    'question-image': 'questions',
    'general': 'uploads',
  };

  return folders[type] || 'uploads';
}