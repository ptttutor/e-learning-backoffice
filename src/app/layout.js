import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout, Menu } from "antd";
import "antd/dist/reset.css";
import {
  AppstoreOutlined,
  BookOutlined,
  UserOutlined,
  DashboardOutlined,
  TagsOutlined,
} from "@ant-design/icons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ฟิสิกส์พี่เต้ย Learning System",
  description: "ระบบเรียนออนไลน์ฟิสิกส์และคณิตศาสตร์",
};

export default function RootLayout({ children }) {
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <a href="/admin/dashboard">แดชบอร์ด</a>,
    },
    {
      key: "/admin/courses",
      icon: <BookOutlined />,
      label: <a href="/admin/courses">คอร์สเรียน</a>,
    },
    {
      key: "/admin/categories",
      icon: <TagsOutlined />,
      label: <a href="/admin/categories">หมวดหมู่</a>,
    },
    {
      key: "/admin/subjects",
      icon: <AppstoreOutlined />,
      label: <a href="/admin/subjects">วิชา</a>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <a href="/admin/users">ผู้ใช้</a>,
    },
  ];
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}