import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Missing publicId parameter' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        result: result
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image from Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed: ' + error.message },
      { status: 500 }
    );
  }
}