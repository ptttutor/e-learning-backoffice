// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle CORS for external API endpoints
  if (request.nextUrl.pathname.startsWith('/api/external/')) {
    const response = NextResponse.next();
    
    // CORS headersss
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/external/:path*',
  ],
};