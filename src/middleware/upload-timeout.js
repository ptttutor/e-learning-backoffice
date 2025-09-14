/**
 * Upload timeout middleware
 * เพิ่ม timeout สำหรับ API routes ที่เกี่ยวข้องกับการอัปโหลด
 */

export function withUploadTimeout(handler, timeoutMs = 300000) { // 5 minutes default
  return async (req, res) => {
    // สร้าง timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs/1000} seconds`));
      }, timeoutMs);
    });

    try {
      // Race between actual handler and timeout
      const result = await Promise.race([
        handler(req, res),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.error('❌ Upload timeout:', error);
        return res.status(408).json({
          success: false,
          error: 'Upload timeout. Please try with a smaller file or check your connection.',
          code: 'UPLOAD_TIMEOUT'
        });
      }
      throw error;
    }
  };
}

/**
 * Apply upload optimizations
 */
export function withUploadOptimizations(handler) {
  return async (req, res) => {
    // Set headers for large file uploads
    res.setHeader('Keep-Alive', 'timeout=300, max=1000');
    res.setHeader('Connection', 'keep-alive');
    
    // Increase max listeners for large uploads
    if (req.socket) {
      req.socket.setMaxListeners(20);
    }

    return handler(req, res);
  };
}

/**
 * Combined middleware for upload routes
 */
export function withUploadMiddleware(handler, options = {}) {
  const { timeout = 300000 } = options;
  
  return withUploadTimeout(
    withUploadOptimizations(handler),
    timeout
  );
}