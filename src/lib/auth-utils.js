import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";
import { verifyExternalToken } from "./jwt";
import { prisma } from "./prisma";
import { headers } from "next/headers";

/**
 * ดึง session จาก NextAuth หรือ JWT Token
 * รองรับทั้ง session cookie (admin/instructor) และ JWT token (students)
 */
async function getAuthSession() {
  // 1. ลองเช็ค NextAuth session ก่อน (สำหรับ admin/instructor)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    console.log('🟢 [Auth] NextAuth session found:', session.user.email, `(${session.user.role})`);
    return { 
      user: session.user, 
      source: 'nextauth' 
    };
  }

  // 2. ถ้าไม่มี session ให้เช็ค JWT token จาก Authorization header
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      console.log('🟢 [Auth] JWT token found, verifying...');
      const verification = verifyExternalToken(token);
      
      if (verification.valid && verification.data) {
        // ดึงข้อมูล user ล่าสุดจาก database
        const user = await prisma.user.findUnique({
          where: { id: verification.data.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            lineId: true,
          }
        });
        
        if (user) {
          console.log('✅ [Auth] JWT token valid:', user.email, `(${user.role})`);
          return { 
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            }, 
            source: 'jwt' 
          };
        } else {
          console.error('❌ [Auth] User not found in database for JWT token');
        }
      } else {
        console.error('❌ [Auth] JWT token verification failed');
      }
    }
  } catch (error) {
    console.error('❌ [Auth] JWT verification error:', error);
  }

  console.log('⚠️ [Auth] No authentication found (no session or token)');
  return { user: null, source: null };
}

/**
 * ตรวจสอบว่ามี session และเป็น ADMIN หรือไม่
 * @returns {Promise<{session: object|null, error: NextResponse|null}>}
 */
export async function requireAdmin() {
  const { user } = await getAuthSession();
  
  if (!user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      )
    };
  }
  
  if (user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" },
        { status: 403 }
      )
    };
  }
  
  return { session: { user }, error: null };
}

/**
 * ตรวจสอบว่ามี session และเป็น INSTRUCTOR หรือไม่
 * @returns {Promise<{session: object|null, error: NextResponse|null}>}
 */
export async function requireInstructor() {
  const { user } = await getAuthSession();
  
  if (!user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      )
    };
  }
  
  if (user.role !== "INSTRUCTOR") {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" },
        { status: 403 }
      )
    };
  }
  
  return { session: { user }, error: null };
}

/**
 * ตรวจสอบว่ามี session (authenticated user) หรือไม่
 * @returns {Promise<{session: object|null, error: NextResponse|null}>}
 */
export async function requireAuth() {
  const { user } = await getAuthSession();
  
  if (!user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      )
    };
  }
  
  return { session: { user }, error: null };
}

/**
 * ตรวจสอบว่าเป็นเจ้าของ resource หรือไม่ (หรือเป็น ADMIN)
 * @param {string} userId - User ID ที่ต้องการตรวจสอบ
 * @returns {Promise<{session: object|null, error: NextResponse|null}>}
 */
export async function requireOwnership(userId) {
  const { user } = await getAuthSession();
  
  if (!user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      )
    };
  }
  
  // ADMIN สามารถเข้าถึงทุกอย่างได้
  if (user.role === "ADMIN") {
    return { session: { user }, error: null };
  }
  
  // ตรวจสอบว่าเป็นเจ้าของหรือไม่
  if (user.id !== userId) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      )
    };
  }
  
  return { session: { user }, error: null };
}

/**
 * ตรวจสอบว่ามี session และเป็น ADMIN หรือ INSTRUCTOR หรือไม่
 * @returns {Promise<{session: object|null, error: NextResponse|null}>}
 */
export async function requireAdminOrInstructor() {
  const { user } = await getAuthSession();
  
  if (!user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      )
    };
  }
  
  if (!["ADMIN", "INSTRUCTOR"].includes(user.role)) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" },
        { status: 403 }
      )
    };
  }
  
  return { session: { user }, error: null };
}
