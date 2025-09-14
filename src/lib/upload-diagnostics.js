/**
 * Upload diagnostics and troubleshooting utilities
 */

export const uploadDiagnostics = {
  
  /**
   * Check upload environment and configuration
   */
  checkEnvironment() {
    const checks = {
      vercelBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
      uploadTimeout: process.env.UPLOAD_TIMEOUT || 'Using default (60s)',
      maxSize: process.env.UPLOAD_MAX_SIZE || 'Using default (50MB)',
      compressionQuality: process.env.UPLOAD_COMPRESSION_QUALITY || 'Using default (0.8)',
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('🔍 Upload Environment Check:', checks);
    return checks;
  },

  /**
   * Log file information for debugging
   */
  logFileInfo(file, prefix = '') {
    const info = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
    };

    console.log(`📄 ${prefix}File Info:`, info);
    return info;
  },

  /**
   * Check if file might cause issues
   */
  checkFileCompatibility(file) {
    const issues = [];
    
    // Size checks
    if (file.size > 15 * 1024 * 1024) {
      issues.push(`Large file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Type checks
    if (!file.type) {
      issues.push('No MIME type detected');
    }
    
    // Name checks
    if (file.name.length > 100) {
      issues.push('Very long filename');
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\.[^.]+$/, ''))) {
      issues.push('Filename contains special characters');
    }

    const result = {
      compatible: issues.length === 0,
      issues,
    };

    if (issues.length > 0) {
      console.warn('⚠️ File compatibility issues:', result);
    } else {
      console.log('✅ File appears compatible');
    }

    return result;
  },

  /**
   * Monitor upload performance
   */
  createPerformanceMonitor() {
    const startTime = Date.now();
    let lastProgressTime = startTime;
    
    return {
      start() {
        console.log('🚀 Upload started at:', new Date().toISOString());
      },
      
      progress(percent) {
        const now = Date.now();
        const totalElapsed = now - startTime;
        const progressElapsed = now - lastProgressTime;
        
        console.log(`📊 Progress: ${percent}% (${totalElapsed}ms total, +${progressElapsed}ms)`);
        lastProgressTime = now;
      },
      
      complete(result) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Upload completed in ${totalTime}ms:`, {
          url: result.url,
          size: result.size,
          compressed: result.compressed,
        });
      },
      
      error(error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Upload failed after ${totalTime}ms:`, error);
      }
    };
  },

  /**
   * Test upload readiness
   */
  async testUploadReadiness() {
    try {
      console.log('🧪 Testing upload readiness...');
      
      // Test environment
      this.checkEnvironment();
      
      // Test Vercel Blob connection
      if (typeof window === 'undefined') {
        // Server-side test
        const { list } = await import('@vercel/blob');
        await list({ limit: 1 });
        console.log('✅ Vercel Blob connection successful');
      } else {
        // Client-side test
        const response = await fetch('/api/upload-blob/test', { method: 'GET' });
        if (response.ok) {
          console.log('✅ Upload API connection successful');
        } else {
          console.error('❌ Upload API connection failed:', response.status);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Upload readiness test failed:', error);
      return false;
    }
  }
};

// Auto-run environment check in development
if (process.env.NODE_ENV === 'development') {
  uploadDiagnostics.checkEnvironment();
}