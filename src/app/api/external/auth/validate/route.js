// src/app/api/external/auth/validate/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyExternalToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
    }

    // Verify JWT token
    const verification = verifyExternalToken(token);
    if (!verification.valid) {
      return NextResponse.json({ 
        valid: false, 
        error: verification.error 
      }, { status: 401 });
    }

    const decoded = verification.data;

    // ดึงข้อมูล user ล่าสุด
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // ดึงข้อมูล enrollments และ orders
    const [enrollments, orders] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: { course: true },
      }),
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    ]);

    return NextResponse.json({ 
      valid: true, 
      user,
      permissions: {
        canAccessCourses: enrollments.length > 0,
        canDownloadEbooks: orders.some(order => order.orderType === 'EBOOK' && order.status === 'COMPLETED'),
        isAdmin: user.role === 'ADMIN',
      },
      stats: {
        enrolledCourses: enrollments.length,
        completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      },
      enrollments: enrollments.map(e => ({
        courseId: e.course.id,
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt,
        progress: e.progress,
      }))
    });

  } catch (error) {
    console.error('❌ Token validation error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}