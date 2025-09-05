import cloudinary from './cloudinary';

// Upload file to Cloudinary
export async function uploadToCloudinary(file, folder = 'payment-slips') {
  try {
    // Convert file to base64 if it's a File object
    let fileData;
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      fileData = `data:${file.type};base64,${base64}`;
    } else {
      fileData = file;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Delete image from Cloudinary
export async function deleteCloudinaryImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(publicId, options = {}) {
  const {
    width = 800,
    height = 600,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { format }
    ]
  });
}

// Get thumbnail URL
export function getThumbnailUrl(publicId, size = 200) {
  return cloudinary.url(publicId, {
    transformation: [
      { width: size, height: size, crop: 'fill' },
      { quality: 'auto' },
      { format: 'auto' }
    ]
  });
}

// Extract public_id from Cloudinary URL
export function extractPublicId(cloudinaryUrl) {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after version (if exists) or after upload
    let publicIdParts = parts.slice(uploadIndex + 1);
    
    // Remove version if exists (starts with 'v' followed by numbers)
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }
    
    // Join and remove file extension
    const publicId = publicIdParts.join('/');
    return publicId.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}