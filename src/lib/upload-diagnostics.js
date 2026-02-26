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
    
    // Type checks
    if (!file.type) {
      issues.push('No MIME type detected');
    }
    
    // Name checks
    if (file.name.length > 200) {
      issues.push('Filename is extremely long (over 200 characters)');
    }
    
    // Note: Special characters are automatically sanitized during upload
    // Only check for truly problematic names
    if (!file.name || file.name.trim() === '') {
      issues.push('Empty filename');
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
   * Create error handler with context
   */
  createErrorHandler(componentName, context = {}) {
    return (error) => {
      const errorInfo = {
        component: componentName,
        context,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      console.error(`❌ Upload error in ${componentName}:`, errorInfo);

      // Provide user-friendly error messages
      let userMessage = 'เกิดข้อผิดพลาดในการอัพโหลด';

      if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'เกิดปัญหาการเชื่อมต่อ กรุณาลองใหม่';
      } else if (error.message.includes('timeout')) {
        userMessage = 'การอัพโหลดใช้เวลานานเกินไป กรุณาลองใหม่';
      } else if (error.message.includes('size') || error.message.includes('large')) {
        userMessage = 'ไฟล์มีขนาดใหญ่เกินไป';
      } else if (error.message.includes('type') || error.message.includes('format')) {
        userMessage = 'รูปแบบไฟล์ไม่ถูกต้อง';
      }

      return {
        userMessage,
        technicalError: error.message,
        errorInfo,
      };
    };
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
      
      end() {
        const totalTime = Date.now() - startTime;
        console.log(`⏱️ Upload operation completed in ${totalTime}ms`);
        return {
          duration: totalTime,
          timestamp: new Date().toISOString(),
        };
      },

      getMetrics() {
        const totalTime = Date.now() - startTime;
        return {
          duration: totalTime,
          startTime: new Date(startTime).toISOString(),
          currentTime: new Date().toISOString(),
        };
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