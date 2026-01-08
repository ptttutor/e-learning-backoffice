'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Layout, theme } from 'antd';
import InstructorSidebar from '../../components/instructor/InstructorSidebar';
import InstructorHeader from '../../components/instructor/InstructorHeader';

const { Header, Sider, Content } = Layout;

export default function InstructorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Authentication and authorization check
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setAuthChecking(false);
        router.push('/login?redirect=' + encodeURIComponent('/instructor/dashboard'));
      }
    }, 5000);

    if (loading) return () => clearTimeout(timeout);

    clearTimeout(timeout);

    if (!user || !isAuthenticated) {
      setAuthChecking(false);
      router.push('/login?redirect=' + encodeURIComponent('/instructor/dashboard'));
      return;
    }

    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      setAuthChecking(false);
      router.push('/');
      return;
    }

    setAuthChecking(false);
  }, [user, isAuthenticated, loading, router]);

  // Show loading screen while checking authentication
  if (loading || authChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  // Show access denied if not instructor or admin
  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
        <button onClick={() => router.push('/')}>กลับหน้าหลัก</button>
      </div>
    );
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle sidebar toggle
  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#fff',
          borderRight: '1px solid rgba(5, 5, 5, 0.06)',
        }}
      >
        <InstructorSidebar collapsed={collapsed} currentPath={pathname} />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 220,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <InstructorHeader
            collapsed={collapsed}
            onToggle={handleToggle}
            user={user}
            onLogout={handleLogout}
          />
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
