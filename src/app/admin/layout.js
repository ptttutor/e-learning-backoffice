"use client";

import { useState } from "react";
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
  const sidebarWidth = collapsed ? "80px" : "220px";

  const toggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle clicked, current state:", collapsed);
    setCollapsed((prev) => !prev);
  };

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

        <nav style={{ padding: "16px 0" }}>
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
