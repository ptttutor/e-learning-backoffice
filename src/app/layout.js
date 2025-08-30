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
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import { Button, Dropdown, Avatar } from "antd";

const { Header, Content, Footer } = Layout;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define menu items - will be updated based on auth status
const getMenuItems = (isAuthenticated) => [
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
    key: "/exams",
    icon: <FileTextOutlined />,
    label: <Link href="/exams">คลังข้อสอบ</Link>,
  },
  ...(isAuthenticated
    ? [
        {
          key: "/dashboard",
          icon: <UserOutlined />,
          label: <Link href="/dashboard">แดชบอร์ด</Link>,
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
      ]
    : [
        {
          key: "/login",
          icon: <UserOutlined />,
          label: <Link href="/login">เข้าสู่ระบบ</Link>,
        },
      ]),
  {
    key: "/about",
    icon: <UserOutlined />,
    label: <Link href="/about">เกี่ยวกับเรา</Link>,
  },
];

function AppLayout({ children }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Check if current path is admin
  const isAdminPath = pathname.startsWith("/admin");

  // Don't show layout for login/register/dashboard pages
  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/dashboard");

  if (isAuthPath) {
    return children;
  }

  // If admin path, return children without layout
  if (isAdminPath) {
    return children;
  }

  const selectedKeys = [pathname];
  const menuItems = getMenuItems(isAuthenticated);

  // User dropdown menu
  const userMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">แดชบอร์ด</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">ข้อมูลส่วนตัว</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: logout,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {/* Header */}
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            background: "#001529",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Link
            href="/"
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 20,
              marginRight: 32,
              textDecoration: "none",
            }}
          >
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
              background: "transparent",
              border: "none",
            }}
          />

          {/* User Section */}
          <div style={{ marginLeft: "auto" }}>
            {isAuthenticated && user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "rgba(255,255,255,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ color: "white", fontSize: "14px" }}>
                    {user.name || user.email}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href="/login">
                  <Button type="primary" size="small">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="small"
                    style={{ color: "white", borderColor: "white" }}
                  >
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            background: "#fff",
            minHeight: 280,
          }}
        >
          {children}
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            background: "#f5f5f5",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          ฟิสิกส์พี่เต้ย Learning System ©{new Date().getFullYear()} Created
          with ❤️
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
        <meta
          name="description"
          content="ระบบเรียนออนไลน์ฟิสิกส์และคณิตศาสตร์"
        />
      </head>
      <body style={{ fontFamily: "var(--font-geist-sans)" }}>
        <SessionProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
