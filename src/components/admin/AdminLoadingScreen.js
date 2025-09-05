"use client";

import { Spin } from "antd";

export default function AdminLoadingScreen({ message = "กำลังตรวจสอบสิทธิ์..." }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ 
          marginTop: '16px', 
          fontSize: '16px', 
          color: '#666' 
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}
