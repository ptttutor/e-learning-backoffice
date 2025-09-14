import { NextResponse } from 'next/server';
import { uploadDiagnostics } from '@/lib/upload-diagnostics';

// GET - Test upload system readiness
export async function GET() {
  try {
    console.log('🧪 Running upload system test...');
    
    const env = uploadDiagnostics.checkEnvironment();
    
    // Test Vercel Blob connection
    let blobTest = false;
    try {
      const { list } = await import('@vercel/blob');
      await list({ limit: 1 });
      blobTest = true;
    } catch (error) {
      console.error('Vercel Blob test failed:', error);
    }

    const result = {
      timestamp: new Date().toISOString(),
      environment: env,
      blobConnection: blobTest,
      status: blobTest && env.vercelBlob ? 'ready' : 'not_ready'
    };

    console.log('🔍 Upload test result:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Upload test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        timestamp: new Date().toISOString(),
        status: 'error'
      }
    }, { status: 500 });
  }
}

// POST - Test file upload with diagnostics
export async function POST(request) {
  try {
    console.log('🧪 Testing file upload with diagnostics...');
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No test file provided'
      }, { status: 400 });
    }

    // Log file info
    const fileInfo = uploadDiagnostics.logFileInfo(file, 'Test ');
    
    // Check compatibility
    const compatibility = uploadDiagnostics.checkFileCompatibility(file);
    
    // Create performance monitor
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    monitor.start();

    const result = {
      timestamp: new Date().toISOString(),
      fileInfo,
      compatibility,
      message: 'Test completed - no actual upload performed'
    };

    monitor.complete({ url: 'test', size: file.size, compressed: false });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Upload test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}