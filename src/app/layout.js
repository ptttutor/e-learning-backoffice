"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdConfigProvider } from '../lib/antd';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
            <AntdRegistry>
              <AntdConfigProvider>
                {children}
              </AntdConfigProvider>
            </AntdRegistry>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
