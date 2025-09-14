import { NextResponse } from 'next/server';
import { listVercelBlobFiles } from '@/lib/vercel-blob';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const limit = parseInt(searchParams.get('limit')) || 1000;

    // List files from Vercel Blob
    const listResult = await listVercelBlobFiles(prefix, limit);

    if (!listResult.success) {
      return NextResponse.json(
        { success: false, error: listResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: listResult.files,
      count: listResult.files.length
    });

  } catch (error) {
    console.error('Vercel Blob list error:', error);
    return NextResponse.json(
      { success: false, error: 'List failed: ' + error.message },
      { status: 500 }
    );
  }
}