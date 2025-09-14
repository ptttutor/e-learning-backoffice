/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // ปิด strict mode เพื่อลด compatibility warnings
  experimental: {
    // ใช้ swc compiler
    forceSwcTransforms: true,
  },
  // เพิ่ม API route timeout สำหรับการอัปโหลดไฟล์ขนาดใหญ่
  serverRuntimeConfig: {
    // จะใช้ได้เฉพาะใน server-side
    apiTimeout: 300000, // 5 minutes
  },
  // กำหนดขนาดไฟล์สูงสุดสำหรับ API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb', // เพิ่มจาก default เป็น 50MB
    },
    responseLimit: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply CORS headers to external API routes
        source: '/api/external/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Apply CORS headers to auth callback (for external frontend redirects)
        source: '/api/auth/callback/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Apply CORS headers to my-courses API (used by external frontend)
        source: '/api/my-courses',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
