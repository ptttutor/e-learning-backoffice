import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', type === 'ebook' ? 'ebooks' : 'covers');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${type === 'ebook' ? 'ebooks' : 'covers'}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}