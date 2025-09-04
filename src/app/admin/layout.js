"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Spin, Result, Button, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  BookOutlined,
  FolderOutlined,
  ReadOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  BankOutlined,
  EditOutlined,
  TagOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const menuItems = [
  {
    key: "/admin/dashboard",
    label: "แดชบอร์ด",
    href: "/admin/dashboard",
    icon: <DashboardOutlined />,
  },
  {
    key: "/admin/orders",
    label: "คำสั่งซื้อ",
    href: "/admin/orders",
    icon: <ShoppingCartOutlined />,
  },
  {
    key: "/admin/shipping",
    label: "การจัดส่ง",
    href: "/admin/shipping",
    icon: <CarOutlined />,
  },
  {
    key: "/admin/courses",
    label: "คอร์สเรียน",
    href: "/admin/courses",
    icon: <BookOutlined />,
  },
  {
    key: "/admin/categories",
    label: "หมวดหมู่คอร์ส",
    href: "/admin/categories",
    icon: <FolderOutlined />,
  },
  {
    key: "/admin/ebooks",
    label: "eBooks",
    href: "/admin/ebooks",
    icon: <ReadOutlined />,
  },
  {
    key: "/admin/ebook-categories",
    label: "หมวดหมู่ eBook",
    href: "/admin/ebook-categories",
    icon: <FileTextOutlined />,
  },
  {
    key: "/admin/exam-categories",
    label: "หมวดหมู่ข้อสอบ",
    href: "/admin/exam-categories",
    icon: <QuestionCircleOutlined />,
  },
  {
    key: "/admin/exam-bank",
    label: "คลังข้อสอบ",
    href: "/admin/exam-bank",
    icon: <BankOutlined />,
  },
  {
    key: "/admin/posts",
    label: "โพสต์",
    href: "/admin/posts",
    icon: <EditOutlined />,
  },
  {
    key: "/admin/post-types",
    label: "ประเภทโพสต์",
    href: "/admin/post-types",
    icon: <TagOutlined />,
  },
  {
    key: "/admin/users",
    label: "ผู้ใช้",
    href: "/admin/users",
    icon: <UserOutlined />,
  },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const sidebarWidth = collapsed ? "80px" : "220px";
  
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  // ตรวจสอบการล็อกอินและสิทธิ์ admin
  useEffect(() => {
    console.log('Admin Layout Check:', { 
      loading, 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      isAuthenticated, 
      userRole: user?.role 
    });
    
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth check timeout, forcing redirect to login');
        setAuthChecking(false);
        router.push('/login?redirect=' + encodeURIComponent('/admin/dashboard'));
      }
    }, 5000);
    
    if (loading) return () => clearTimeout(timeout);
    
    clearTimeout(timeout);
    
    if (!user || !isAuthenticated) {
      console.log('No user or not authenticated, redirecting to login');
      setAuthChecking(false);
      router.push('/login?redirect=' + encodeURIComponent('/admin/dashboard'));
      return;
    }
    
    if (user.role !== 'ADMIN') {
      console.log('User is not admin, redirecting to dashboard');
      setAuthChecking(false);
      router.push('/dashboard');
      return;
    }
    
    console.log('Auth check passed, setting authChecking to false');
    setAuthChecking(false);
  }, [user, isAuthenticated, loading, router]);

  // แสดง loading ขณะตรวจสอบ auth
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
          <div style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
            กำลังตรวจสอบสิทธิ์...
          </div>
        </div>
      </div>
    );
  }

  // ถ้าไม่ใช่ admin แสดงหน้า access denied
  if (!user || user.role !== 'ADMIN') {
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
          title="403"
          subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
          icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
          extra={
            <Button 
              type="primary" 
              onClick={() => router.push('/dashboard')}
            >
              กลับไปหน้าหลัก
            </Button>
          }
        />
      </div>
    );
  }

  const toggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle clicked, current state:", collapsed);
    setCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Dropdown menu items สำหรับ user profile
  const userMenuItems = [
    {
      key: 'profile',
      label: 'ข้อมูลส่วนตัว',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'การตั้งค่า',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'ออกจากระบบ',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarWidth,
          backgroundColor: "#222",
          color: "#fff",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          transition: "width 0.3s ease",
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with toggle button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid #333",
            minHeight: "64px",
          }}
        >
          {!collapsed && (
            <div
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                letterSpacing: "1px",
              }}
            >
              Admin Panel
            </div>
          )}
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#444";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        <nav style={{ 
          padding: "16px 0",
          flex: '1',
          paddingBottom: '80px' // เว้นที่สำหรับ user info section
        }}>
          {menuItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: collapsed ? "12px 16px" : "12px 24px",
                color: "#fff",
                textDecoration: "none",
                transition: "all 0.3s ease",
                gap: collapsed ? "0" : "12px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title={collapsed ? item.label : ""}
            >
              <span style={{ fontSize: "16px", minWidth: "16px" }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* User Info Section */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          borderTop: '1px solid #333',
          padding: '16px',
          backgroundColor: '#1a1a1a'
        }}>
          {collapsed ? (
            <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Avatar 
                  size="small"
                  style={{ backgroundColor: '#52c41a' }}
                  icon={<UserOutlined />}
                />
              </div>
            </Dropdown>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Avatar 
                  size="small"
                  style={{ backgroundColor: '#52c41a' }}
                  icon={<UserOutlined />}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user?.name || 'Admin User'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    ผู้ดูแลระบบ
                  </div>
                </div>
                <LogoutOutlined style={{ 
                  fontSize: '14px', 
                  color: '#888',
                  opacity: 0.7
                }} />
              </div>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarWidth,
          backgroundColor: "#f7f7f7",
          minHeight: "100vh",
          width: `calc(100% - ${sidebarWidth})`,
          padding: "0",
          transition: "margin-left 0.3s ease, width 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
