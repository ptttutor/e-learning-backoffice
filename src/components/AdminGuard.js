"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/contexts/AuthContext';
import { Spin, Result, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AdminGuard Check:', { 
      loading, 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      isAuthenticated 
    });

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading || authChecking) {
        console.log('AdminGuard timeout, stopping auth check');
        setAuthChecking(false);
      }
    }, 5000);

    if (loading) return () => clearTimeout(timeout);

    clearTimeout(timeout);
    setAuthChecking(false);

    // ถ้าไม่ได้ล็อกอิน
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // ถ้าล็อกอินแล้วแต่ไม่ใช่ admin
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, loading, router, authChecking]);

  // แสดง loading ขณะตรวจสอบ
  if (loading || authChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ 
            marginTop: '16px', 
            fontSize: '16px', 
            color: '#666' 
          }}>
            กำลังตรวจสอบสิทธิ์การเข้าถึง...
          </div>
        </div>
      </div>
    );
  }

  // ถ้าไม่ได้ล็อกอิน
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Result
          status="warning"
          title="กรุณาเข้าสู่ระบบ"
          subTitle="คุณต้องเข้าสู่ระบบก่อนเข้าใช้งานส่วนผู้ดูแล"
          icon={<UserOutlined style={{ color: '#faad14' }} />}
          extra={
            <Button 
              type="primary" 
              onClick={() => router.push('/login')}
            >
              เข้าสู่ระบบ
            </Button>
          }
        />
      </div>
    );
  }

  // ถ้าไม่ใช่ admin
  if (user && user.role !== 'ADMIN') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Result
          status="403"
          title="ไม่มีสิทธิ์เข้าถึง"
          subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ"
          icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
          extra={[
            <Button 
              type="primary" 
              key="dashboard"
              onClick={() => router.push('/dashboard')}
            >
              กลับไปหน้าหลัก
            </Button>,
            <Button 
              key="logout"
              onClick={() => {
                // Logout and redirect to login
                localStorage.removeItem('user');
                router.push('/login');
              }}
            >
              เข้าสู่ระบบด้วยบัญชีอื่น
            </Button>
          ]}
        />
      </div>
    );
  }
  return children;
}
