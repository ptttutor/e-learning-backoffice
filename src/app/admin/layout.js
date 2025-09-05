"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Layout, theme } from "antd";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminLoadingScreen from "../../components/admin/AdminLoadingScreen";
import AdminAccessDenied from "../../components/admin/AdminAccessDenied";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
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
    console.log("Admin Layout Check:", {
      loading,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      isAuthenticated,
      userRole: user?.role,
    });

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Auth check timeout, forcing redirect to login");
        setAuthChecking(false);
        router.push(
          "/login?redirect=" + encodeURIComponent("/admin/dashboard")
        );
      }
    }, 5000);

    if (loading) return () => clearTimeout(timeout);

    clearTimeout(timeout);

    if (!user || !isAuthenticated) {
      console.log("No user or not authenticated, redirecting to login");
      setAuthChecking(false);
      router.push("/login?redirect=" + encodeURIComponent("/admin/dashboard"));
      return;
    }

    if (user.role !== "ADMIN") {
      console.log("User is not admin, redirecting to dashboard");
      setAuthChecking(false);
      router.push("/dashboard");
      return;
    }

    console.log("Auth check passed, setting authChecking to false");
    setAuthChecking(false);
  }, [user, isAuthenticated, loading, router]);

  // Show loading screen while checking authentication
  if (loading || authChecking) {
    return <AdminLoadingScreen />;
  }

  // Show access denied if not admin
  if (!user || user.role !== "ADMIN") {
    return <AdminAccessDenied />;
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle sidebar toggle
  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={80}
        style={{
          background: "#001529",
        }}
      >
        <AdminSidebar collapsed={collapsed} pathname={pathname} />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ transition: "margin-left 0.2s" }}>
        {/* Top Navigation Bar */}
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <AdminHeader
            collapsed={collapsed}
            onToggle={handleToggle}
            user={user}
            onLogout={handleLogout}
          />
        </Header>

        {/* Content Area */}
        <Content
          style={{
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
