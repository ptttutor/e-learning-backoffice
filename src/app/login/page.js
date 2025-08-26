"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Input, Button, message } from "antd";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // mock login: ตรวจสอบ email ว่ามีในระบบหรือไม่
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data && data.id) {
        localStorage.setItem("userId", data.id);
        message.success("เข้าสู่ระบบสำเร็จ");
        router.push("/courses");
      } else {
        message.error("ไม่พบผู้ใช้งานนี้");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 350 }}>
        <Typography.Title level={3}>เข้าสู่ระบบลูกค้า</Typography.Title>
        <Input
          placeholder="อีเมลลูกค้า"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Button type="primary" block loading={loading} onClick={handleLogin}>
          เข้าสู่ระบบ
        </Button>
      </Card>
    </div>
  );
}
