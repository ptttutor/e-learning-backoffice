"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, List, Typography, Button, Empty, Space, Tag, Spin } from "antd";
import { BookOutlined, ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

async function getCourses() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/courses`, { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'orange';
      case 'CLOSED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'เผยแพร่';
      case 'DRAFT': return 'ฉบับร่าง';
      case 'CLOSED': return 'ปิด';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดคอร์ส...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={2}>
            <BookOutlined style={{ marginRight: 8 }} />
            คอร์สเรียนทั้งหมด
          </Title>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <Empty 
            description="ไม่มีคอร์สในขณะนี้" 
            style={{ marginTop: 40 }}
          />
        ) : (
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
                          {getStatusText(course.status)}
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
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary">
                            ผู้สอน: {course.instructor?.name || 'ไม่ระบุ'}
                          </Text>
                          {course.price ? (
                            <Text strong style={{ color: '#1890ff' }}>
                              <DollarOutlined /> ฿{course.price.toLocaleString()}
                            </Text>
                          ) : (
                            <Text strong style={{ color: '#52c41a' }}>
                              ฟรี
                            </Text>
                          )}
                        </div>

                        {course.category && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              หมวดหมู่: {course.category.name}
                            </Text>
                          </div>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}

        <div style={{ marginTop: 32 }}>
          <Title level={4}>คอร์สเรียนทั้งหมด</Title>
          <List
            dataSource={courses}
            renderItem={(course) => (
              <List.Item>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Link href={`/courses/detail/${course.id}`} style={{ fontWeight: 600, fontSize: 18 }}>{course.title}</Link>
                    <div style={{ color: '#888' }}>{course.description}</div>
                  </div>
                  <div>
                    <Link href={`/courses/detail/${course.id}`}>
                      <Button type="primary" size="small">ดูรายละเอียด/ชำระเงิน</Button>
                    </Link>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </div>
  );
}