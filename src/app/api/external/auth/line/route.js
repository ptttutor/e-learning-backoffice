// src/app/api/external/auth/line/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExternalToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { code, redirectUri } = await request.json();
    console.log('🟢 [Backend] LINE login request received');
    console.log('🟢 [Backend] Code:', code?.substring(0, 20) + '...');
    console.log('🟢 [Backend] Redirect URI:', redirectUri);
    
    if (!code) {
      console.error('❌ [Backend] Missing authorization code');
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // 1. แลก code กับ access token
    console.log('🔄 [Backend] Exchanging code for access token...');
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINE_CLIENT_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ [Backend] Token exchange failed:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to exchange authorization code' },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('✅ [Backend] Got access token');

    // 2. ดึงข้อมูล LINE profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('❌ [Backend] Failed to fetch LINE profile');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 400 }
      );
    }

    const lineProfile = await profileResponse.json();
    console.log('✅ [Backend] Got LINE profile:', lineProfile.displayName, `(${lineProfile.userId})`);

    // 3. สร้างหรือค้นหา user ในระบบ
    let user = await prisma.user.findUnique({
      where: { lineId: lineProfile.userId }
    });

    if (!user) {
      // สร้าง user ใหม่
      user = await prisma.user.create({
        data: {
          lineId: lineProfile.userId,
          email: lineProfile.email || `${lineProfile.userId}@line.user`,
          name: lineProfile.displayName,
          image: lineProfile.pictureUrl,
          role: 'STUDENT', // แก้ไขจาก 'USER' เป็น 'STUDENT'
        }
      });
      console.log('✅ [Backend] Created new user:', user.email, `(ID: ${user.id})`);
    } else {
      // อัพเดทข้อมูล user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: lineProfile.displayName,
          image: lineProfile.pictureUrl,
        }
      });
      console.log('✅ [Backend] Updated existing user:', user.email, `(ID: ${user.id})`);
    }

    // 4. สร้าง JWT token สำหรับ external frontend
    console.log('🟢 [Backend] Creating JWT token for user:', user.id);
    const externalToken = createExternalToken(user);
    console.log('✅ [Backend] JWT token created successfully');

    // 5. ส่งข้อมูลกลับ
    return NextResponse.json({
      success: true,
      data: {
        token: externalToken,
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
    console.error('❌ LINE login error:', error);
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