"use client";

import { Result, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function AdminAccessDenied() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
        icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
        extra={
          <Button 
            type="primary" 
            onClick={() => router.push('/dashboard')}
          >
            กลับไปหน้าหลัก
          </Button>
        }
      />
    </div>
  );
}
