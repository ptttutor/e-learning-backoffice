"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, List, Typography, Button, Empty, Space, Tag, Spin } from "antd";
import { BookOutlined, ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("userId");
      setUserId(uid);
      if (uid) fetchMyCourses(uid);
      else setLoading(false);
    }
  }, []);

  async function fetchMyCourses(uid) {
    setLoading(true);
    const res = await fetch(`/api/my-courses?userId=${uid}`);
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'orange';
      case 'CLOSED': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดคอร์สของฉัน...</div>
      </div>
    );
  }
  if (!userId)
    return <Empty description="กรุณาเข้าสู่ระบบก่อน" style={{marginTop:48}} />;
  if (!courses.length)
    return <Empty description="ยังไม่มีคอร์สที่ซื้อ" style={{marginTop:48}} />;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={2}>
            <BookOutlined style={{ marginRight: 8 }} />
            คอร์สของฉัน
          </Title>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={courses}
          renderItem={(course) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Link key="view" href={`/courses/${course.id}`}>
                    <Button type="primary" block>
                      ดูรายละเอียด
                    </Button>
                  </Link>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {course.title}
                      </Text>
                      <Tag color={getStatusColor(course.status)}>
                        ซื้อแล้ว
                      </Tag>
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Paragraph 
                        ellipsis={{ rows: 3, expandable: false }} 
                        style={{ marginBottom: 8, color: '#666' }}
                      >
                        {course.description || 'ไม่มีรายละเอียด'}
                      </Paragraph>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
}
