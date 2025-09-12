"use client";

import { Menu, Typography } from "antd";
import {
  DashboardOutlined,
  DollarOutlined,
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
  TagsOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Text } = Typography;

const menuItems = [
  {
    key: "/admin/dashboard",
    label: "แดชบอร์ด",
    icon: <DashboardOutlined />,
  },
  {
    key: "/admin/orders",
    label: "คำสั่งซื้อ",
    icon: <ShoppingCartOutlined />,
  },
  {
    key: "/admin/coupons",
    label: "คูปอง",
    icon: <TagsOutlined />,
  },
  {
    key: "/admin/shipping",
    label: "การจัดส่ง",
    icon: <CarOutlined />,
  },
  {
    key: "/admin/courses",
    label: "คอร์สเรียน",
    icon: <BookOutlined />,
  },
  {
    key: "/admin/categories",
    label: "หมวดหมู่คอร์ส",
    icon: <FolderOutlined />,
  },
  {
    key: "/admin/ebooks",
    label: "หนังสือ",
    icon: <ReadOutlined />,
  },
  {
    key: "/admin/ebook-categories",
    label: "หมวดหมู่หนังสือ",
    icon: <FolderOutlined />,
  },
  {
    key: "/admin/exam-bank",
    label: "คลังข้อสอบ",
    icon: <BankOutlined />,
  },
  {
    key: "/admin/exam-categories",
    label: "หมวดหมู่ข้อสอบ",
    icon: <QuestionCircleOutlined />,
  },
  {
    key: "/admin/posts",
    label: "โพสต์",
    icon: <EditOutlined />,
  },
  {
    key: "/admin/post-categories",
    label: "หมวดหมู่โพสต์",
    icon: <TagOutlined />,
  },
  {
    key: "/admin/users",
    label: "ผู้ใช้",
    icon: <UserOutlined />,
  },
  // {
  //   key: "/admin/email-test",
  //   label: "ทดสอบ Email",
  //   icon: <MailOutlined />,
  // },
];

export default function AdminSidebar({ collapsed, pathname }) {
  // Navigation menu items with Links
  const navMenuItems = menuItems.map((item) => ({
    ...item,
    label: (
      <Link href={item.key} style={{ textDecoration: "none" }}>
        {item.label}
      </Link>
    ),
  }));

  return (
    <>
      {/* Logo/Brand */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 24px",
          borderBottom: "1px solid #303030",
        }}
      >
        {collapsed ? (
          <Text style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
            A
          </Text>
        ) : (
          <Text style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
            Admin Panel
          </Text>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={navMenuItems}
        style={{
          borderRight: 0,
          flex: 1,
        }}
      />
    </>
  );
}
