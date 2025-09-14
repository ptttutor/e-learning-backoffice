import { NextResponse } from 'next/server';
import { deleteFromVercelBlob } from '@/lib/vercel-blob';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Missing file URL parameter' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    const deleteResult = await deleteFromVercelBlob(url);

    if (deleteResult.success) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete file: ' + deleteResult.error },
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