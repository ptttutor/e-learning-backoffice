import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

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

    // Validate file type
    if (type === 'ebook') {
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|epub|mobi)$/i)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only PDF, EPUB, and MOBI files are allowed.' },
          { status: 400 }
        );
      }
    } else if (type === 'cover' || type === 'question') {
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
        folder: type === 'ebook' ? 'e-learning/ebooks' : 
                type === 'cover' ? 'e-learning/covers' : 'e-learning/questions',
        resource_type: type === 'ebook' ? 'raw' : 'image',
        public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      };

      // For images, add transformation options
      if (type === 'cover' || type === 'question') {
        uploadOptions.transformation = [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ];
      }

      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      filename: file.name,
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
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

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
