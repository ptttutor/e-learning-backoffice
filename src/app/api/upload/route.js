import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'ebook' or 'cover'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (type === 'ebook') {
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|epub|mobi)$/i)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only PDF, EPUB, and MOBI files are allowed.' },
          { status: 400 }
        );
      }
    } else if (type === 'cover') {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only image files are allowed.' },
          { status: 400 }
        );
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: type === 'ebook' ? 'e-learning/ebooks' : 'e-learning/covers',
        resource_type: type === 'ebook' ? 'raw' : 'image',
        public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      };

      // For images, add transformation options
      if (type === 'cover') {
        uploadOptions.transformation = [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ];
      }

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
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
      cloudinary_url: uploadResult.secure_url
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}