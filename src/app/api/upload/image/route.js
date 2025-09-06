import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general'; // Optional folder parameter
    const width = formData.get('width') || 800; // Optional width parameter
    const height = formData.get('height') || 600; // Optional height parameter

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 5MB.' 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `e-learning/${folder}`,
        resource_type: 'image',
        public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        transformation: [
          { 
            width: parseInt(width), 
            height: parseInt(height), 
            crop: 'limit',
            quality: 'auto',
            format: 'auto'
          }
        ]
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
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
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Use cloudinary for deletion
    const deleteResult = await cloudinary.uploader.destroy(publicId);

    if (deleteResult.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
