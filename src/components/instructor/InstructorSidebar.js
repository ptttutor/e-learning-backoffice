"use client";

import { Menu, Typography } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Text } = Typography;

const menuItems = [
  {
    key: "/instructor/dashboard",
    label: "แดชบอร์ด",
    icon: <DashboardOutlined />,
  },
  // {
  //   key: "/instructor/courses",
  //   label: "คอร์สของฉัน",
  //   icon: <BookOutlined />,
  // },
  // {
  //   key: "/instructor/orders",
  //   label: "ยอดขาย",
  //   icon: <ShoppingCartOutlined />,
  // },
  // {
  //   key: "/instructor/analytics",
  //   label: "สถิติ",
  //   icon: <BarChartOutlined />,
  // },
];

export default function InstructorSidebar({ collapsed, currentPath }) {
  // Convert menu items to Ant Design Menu format with Next.js Links
  const getMenuItem = (item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children.map(getMenuItem),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: <Link href={item.key}>{item.label}</Link>,
    };
  };

  const items = menuItems.map(getMenuItem);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
          backgroundColor: "#fff",
        }}
      >
        {!collapsed ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#52c41a",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              I
            </div>
            <Text strong style={{ fontSize: "16px", color: "#000" }}>
              Instructor
            </Text>
          </div>
        ) : (
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#52c41a",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            I
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[currentPath]}
        items={items}
        style={{
          borderRight: 0,
          flex: 1,
          paddingTop: "8px",
        }}
      />
    </div>
  );
}
