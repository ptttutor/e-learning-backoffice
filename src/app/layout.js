"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout, Menu, ConfigProvider } from "antd";
import "antd/dist/reset.css";
import {
  BookOutlined,
  UserOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CartProvider } from "./contexts/CartContext";

const { Header, Content, Footer } = Layout;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define menu items
const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link href="/">หน้าหลัก</Link>,
  },
  {
    key: "/courses",
    icon: <BookOutlined />,
    label: <Link href="/courses">คอร์สเรียน</Link>,
  },
  {
    key: "/ebooks",
    icon: <BookOutlined />,
    label: <Link href="/ebooks">หนังสือ</Link>,
  },
  {
    key: "/my-courses",
    icon: <BookOutlined />,
    label: <Link href="/my-courses">คอร์สเรียนของฉัน</Link>,
  },
  {
    key: "/cart",
    icon: <ShoppingCartOutlined />,
    label: <Link href="/cart">ตะกร้า</Link>,
  },
  {
    key: "/my-orders",
    icon: <FileTextOutlined />,
    label: <Link href="/my-orders">คำสั่งซื้อ</Link>,
  },
  {
    key: "/about",
    icon: <UserOutlined />,
    label: <Link href="/about">เกี่ยวกับเรา</Link>,
  },
];

function AppLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current path is admin
  const isAdminPath = pathname.startsWith('/admin');
  
  // Don't show layout for login/register pages
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  if (isAuthPath) {
    return children;
  }

  // If admin path, return children without layout
  if (isAdminPath) {
    return children;
  }

  const selectedKeys = [pathname];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontFamily: 'var(--font-geist-sans)',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Header */}
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#001529',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Link href="/" style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: 20,
            marginRight: 32,
            textDecoration: 'none'
          }}>
            ฟิสิกส์พี่เต้ย Learning System
          </Link>
          
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={menuItems}
            style={{ 
              flex: 1, 
              minWidth: 0,
              background: 'transparent',
              border: 'none'
            }}
          />
        </Header>

        {/* Content */}
        <Content style={{ 
          background: '#fff',
          minHeight: 280,
        }}>
          {children}
        </Content>

        {/* Footer */}
        <Footer style={{ 
          textAlign: 'center', 
          background: '#f5f5f5',
          borderTop: '1px solid #f0f0f0'
        }}>
          ฟิสิกส์พี่เต้ย Learning System ©{new Date().getFullYear()} Created with ❤️
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <title>ฟิสิกส์พี่เต้ย Learning System</title>
        <meta name="description" content="ระบบเรียนออนไลน์ฟิสิกส์และคณิตศาสตร์" />
      </head>
      <body style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <CartProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </CartProvider>
      </body>
    </html>
  );
}