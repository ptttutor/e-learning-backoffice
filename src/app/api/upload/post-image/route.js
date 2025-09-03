import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique public_id
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const suffix = isMobile ? '_mobile' : '_desktop';
    const publicId = `${timestamp}_${cleanFileName}${suffix}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      buffer, 
      'e-learning/posts', 
      publicId
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
      isMobile: isMobile,
      cloudinary_url: uploadResult.secure_url
    });

  } catch (error) {
    console.error('Post image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}
