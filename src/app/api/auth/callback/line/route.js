// src/app/api/auth/callback/line/route.js
// LINE OAuth callback endpoint (สำหรับ internal frontend)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  console.log('🔄 LINE OAuth callback started');
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('� Callback parameters:', { 
      code: code ? `${code.substring(0, 10)}...` : null, 
      state, 
      error 
    });

    if (error) {
      console.error('❌ LINE OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=line_oauth_error', request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // 1. แลก code กับ access token
    console.log('🔄 Exchanging code for access token...');
    
    const redirectUri = `${new URL(request.url).origin}/api/auth/callback/line`;
    console.log('📍 Using redirect URI:', redirectUri);
    
    const tokenParams = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_CLIENT_ID,
      client_secret: process.env.LINE_CLIENT_SECRET,
    };
    
    console.log('🔑 Token request params:', {
      ...tokenParams,
      client_secret: process.env.LINE_CLIENT_SECRET ? '[HIDDEN]' : '[NOT SET]'
    });

    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Got access token:', { 
      token_type: tokens.token_type,
      expires_in: tokens.expires_in 
    });

    // 2. ดึงข้อมูล LINE profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('❌ Failed to fetch LINE profile');
      return NextResponse.redirect(new URL('/login?error=profile_fetch_failed', request.url));
    }

    const lineProfile = await profileResponse.json();
    console.log('✅ Got LINE profile:', lineProfile.displayName);

    // 3. สร้างหรือค้นหา user ในระบบ
    console.log('🔍 Finding or creating user...');
    
    let user = await prisma.user.findUnique({
      where: { lineId: lineProfile.userId }
    });

    if (!user) {
      console.log('👤 Creating new user for LINE ID:', lineProfile.userId);
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
      console.log('✅ Created new user:', { id: user.id, email: user.email });
    } else {
      console.log('👤 Updating existing user:', user.id);
      // อัพเดทข้อมูล user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: lineProfile.displayName,
          image: lineProfile.pictureUrl,
        }
      });
      console.log('✅ Updated existing user:', { id: user.id, email: user.email });
    }

    // 4. ตรวจสอบ state parameter เพื่อดู origin ที่ส่งมา
    let redirectUrl;
    
    if (state && state.startsWith('http')) {
      // มี state และเป็น URL ที่ valid -> redirect กลับไป origin (tutor frontend)
      try {
        const originUrl = new URL(state);
        redirectUrl = new URL('/', originUrl);
        redirectUrl.searchParams.set('login_success', 'true');
        redirectUrl.searchParams.set('user_id', user.id);
        redirectUrl.searchParams.set('user_name', encodeURIComponent(user.name));
        redirectUrl.searchParams.set('user_email', encodeURIComponent(user.email));
        redirectUrl.searchParams.set('line_id', user.lineId);
        console.log('✅ Redirecting to external frontend:', redirectUrl.toString());
      } catch (e) {
        console.error('❌ Invalid state URL, falling back to internal redirect');
        redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('login_success', 'true');
      }
    } else {
      // ไม่มี state หรือไม่ใช่ URL -> redirect ภายใน e-learning
      redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('login_success', 'true');
      redirectUrl.searchParams.set('user_name', user.name);
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ LINE OAuth callback error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // ส่ง error details มากขึ้นใน development
    const isDev = process.env.NODE_ENV === 'development';
    const errorParam = isDev ? `internal_error&details=${encodeURIComponent(error.message)}` : 'internal_error';
    
    // ใน development ให้ไปที่ debug page
    const redirectPath = isDev ? `/debug?error=${errorParam}` : `/login?error=${errorParam}`;
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
}

// สำหรับ preflight CORS request
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
