import { NextResponse } from 'next/server';
import { deleteFromVercelBlob } from '@/lib/vercel-blob';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    const deleteResult = await deleteFromVercelBlob(url);

    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, error: deleteResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Vercel Blob delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed: ' + error.message },
      { status: 500 }
    );
  }
}