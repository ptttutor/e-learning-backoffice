// Middleware สำหรับตรวจสอบสิทธิ์ Admin
export function checkAdminAuth(req) {
  // ในการใช้งานจริงควรตรวจสอบ JWT token หรือ session
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  // ตรวจสอบ token (ในตัวอย่างนี้ใช้การตรวจสอบแบบง่าย)
  const token = authHeader.replace('Bearer ', '');
  
  // ในการใช้งานจริงควรตรวจสอบ JWT token
  if (token === 'admin-token') {
    return true;
  }

  return false;
}

export function requireAdmin(handler) {
  return async (req, ...args) => {
    // ข้าม middleware สำหรับ development
    if (process.env.NODE_ENV === 'development') {
      return handler(req, ...args);
    }

    const isAdmin = checkAdminAuth(req);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Unauthorized: Admin access required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return handler(req, ...args);
  };
}