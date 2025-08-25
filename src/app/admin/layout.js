"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Button,
  Badge,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  BellOutlined,
  FileTextOutlined,
  GiftOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  TagsOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ตรวจสอบ session
    const session = localStorage.getItem("adminSession");
    if (session) {
      setAdminSession(JSON.parse(session));
    } else if (pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/admin/login");
  };

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "จัดการผู้ใช้",
      children: [
        {
          key: "/admin/users",
          label: "รายการผู้ใช้",
        },
        {
          key: "/admin/users/create",
          label: "เพิ่มผู้ใช้ใหม่",
        },
      ],
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "จัดการคอร์ส",
      children: [
        {
          key: "/admin/courses",
          label: "รายการคอร์ส",
        },
        {
          key: "/admin/courses/create",
          label: "สร้างคอร์สใหม่",
        },
        {
          key: "/admin/categories",
          label: "หมวดหมู่",
        },
        {
          key: "/admin/subjects",
          label: "วิชา",
        },
      ],
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "จัดการคำสั่งซื้อ",
      children: [
        {
          key: "/admin/orders",
          label: "รายการคำสั่งซื้อ",
        },
        {
          key: "/admin/payment-receipts",
          label: "ใบเสร็จการชำระเงิน",
        },
      ],
    },
    {
      key: "content",
      icon: <FileTextOutlined />,
      label: "จัดการเนื้อหา",
      children: [
        {
          key: "/admin/articles",
          label: "บทความ",
        },
        {
          key: "/admin/announcements",
          label: "ประกาศ",
        },
        {
          key: "/admin/exam-sets",
          label: "ชุดข้อสอบ",
        },
      ],
    },
    {
      key: "promotions",
      icon: <GiftOutlined />,
      label: "โปรโมชั่น",
    },
    {
      key: "student",
      icon: <TrophyOutlined />,
      label: "จัดการนักเรียน",
      children: [
        {
          key: "/admin/enrollments",
          label: "การลงทะเบียน",
        },
        {
          key: "/admin/reviews",
          label: "รีวิว",
        },
        {
          key: "/admin/certificates",
          label: "ใบประกาศนียบัตร",
        },
      ],
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: "การสื่อสาร",
      children: [
        {
          key: "/admin/notifications",
          label: "การแจ้งเตือน",
        },
        {
          key: "/admin/discussions",
          label: "กระทู้สนทนา",
        },
      ],
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "รายงานและสถิติ",
      children: [
        {
          key: "/admin/activity-logs",
          label: "บันทึกกิจกรรม",
        },
        {
          key: "/admin/analytics",
          label: "สถิติการใช้งาน",
        },
      ],
    },
    {
      key: "database",
      icon: <DatabaseOutlined />,
      label: "จัดการฐานข้อมูล",
      children: [
        {
          key: "/admin/database/tables",
          label: "ตารางข้อมูล",
        },
        {
          key: "/admin/database/backup",
          label: "สำรองข้อมูล",
        },
        {
          key: "/admin/database/import",
          label: "นำเข้าข้อมูล",
        },
      ],
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "ตั้งค่าระบบ",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "โปรไฟล์",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: handleLogout,
    },
  ];

  // ถ้าอยู่ในหน้า login ให้แสดงเฉพาะ children
  if (pathname === "/admin/login") {
    return children;
  }

  // ถ้าไม่มี session ให้แสดงหน้าว่าง (จะ redirect ไปหน้า login)
  if (!adminSession) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: "#001529",
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#002140",
          }}
        >
          <Space>
            <SafetyOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
            {!collapsed && (
              <Title
                level={4}
                style={{ color: "white", margin: 0, fontSize: "16px" }}
              >
                Admin Panel
              </Title>
            )}
          </Space>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key.startsWith("/admin/")) {
              router.push(key);
            }
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Space>

          <Space>
            <Badge count={5}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: "16px" }}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{adminSession?.email}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Administrator
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
