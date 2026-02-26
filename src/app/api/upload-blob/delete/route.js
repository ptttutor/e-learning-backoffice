import { NextResponse } from 'next/server';
import { deleteFromVercelBlob } from '@/lib/vercel-blob';
import { requireAuth } from '@/lib/auth-utils';

export async function DELETE(request) {
  try {
    // ตรวจสอบสิทธิ์ authenticated user
    const { session, error } = await requireAuth();
    if (error) return error;
    
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