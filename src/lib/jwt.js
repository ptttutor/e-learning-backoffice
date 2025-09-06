// src/lib/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * Create JWT token for external frontend
 */
export const createExternalToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lineId: user.lineId,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'e-learning-system',
    audience: 'external-frontend'
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyExternalToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'e-learning-system',
      audience: 'external-frontend'
    });
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Refresh JWT token
 */
export const refreshExternalToken = (token) => {
  const verification = verifyExternalToken(token);
  if (!verification.valid) {
    return null;
  }

  // สร้าง token ใหม่ด้วยข้อมูลเดิม (ลบ iat, exp ออก)
  const { iat, exp, ...userData } = verification.data;
  return jwt.sign(userData, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'e-learning-system',
    audience: 'external-frontend'
  });
};