// src/app/api/external/auth/exchange/route.js
// แลก user data จาก LINE callback เป็น JWT token
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExternalToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { userId, lineId } = await request.json();
    
    if (!userId && !lineId) {
      return NextResponse.json(
        { success: false, error: 'userId or lineId is required' },
        { status: 400 }
      );
    }

    // ค้นหา user ในฐานข้อมูล
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (lineId) {
      user = await prisma.user.findUnique({
        where: { lineId: lineId }
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // สร้าง JWT token
    const token = createExternalToken(user);

    // ส่งข้อมูลกลับ
    return NextResponse.json({
      success: true,
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          lineId: user.lineId,
        },
        expiresIn: '7d',
        tokenType: 'Bearer'
      }
    });

  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// สำหรับ preflight CORS request
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
