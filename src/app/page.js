'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ไปหน้า admin login ทันที
    router.replace('/admin');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>กำลังเข้าสู่ระบบจัดการ...</h2>
        <p>Redirecting to admin panel...</p>
      </div>
    </div>
  );
}