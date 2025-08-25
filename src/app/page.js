'use client'

import Link from 'next/link'
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  Divider,
  Tag
} from 'antd'
import {
  BookOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  RocketOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export default function Home() {
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ fontSize: '3rem', marginBottom: 16 }}>
            <BookOutlined style={{ color: '#1890ff' }} /> ฟิสิกส์พี่เต้ย
          </Title>
          <Title level={2} style={{ color: '#666', fontWeight: 'normal' }}>
            Learning Management System
          </Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            ระบบเรียนออนไลน์ฟิสิกส์และคณิตศาสตร์ที่ครบครันด้วย Next.js, Prisma และ PostgreSQL
          </Paragraph>
        </div>

        {/* Status Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '2rem', color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Next.js 15</Title>
              <Text type="secondary">React Framework</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '2rem', color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Prisma ORM</Title>
              <Text type="secondary">Database Layer</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '2rem', color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>PostgreSQL</Title>
              <Text type="secondary">Prisma Cloud</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: '2rem', color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Ant Design</Title>
              <Text type="secondary">UI Components</Text>
            </Card>
          </Col>
        </Row>

        {/* Features */}
        <Card style={{ marginBottom: 48 }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
            ฟีเจอร์ที่พร้อมใช้งาน
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Tag color="blue">User Management</Tag>
                  <Text>ระบบจัดการผู้ใช้ (Admin, Teacher, Student)</Text>
                </div>
                <div>
                  <Tag color="green">Course System</Tag>
                  <Text>ระบบคอร์สเรียนและบทเรียน</Text>
                </div>
                <div>
                  <Tag color="orange">Payment System</Tag>
                  <Text>ระบบชำระเงินและใบเสร็จ</Text>
                </div>
                <div>
                  <Tag color="purple">Progress Tracking</Tag>
                  <Text>ติดตามความก้าวหน้าการเรียน</Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Tag color="red">Exam Repository</Tag>
                  <Text>คลังข้อสอบ GAT-PAT, A-Level</Text>
                </div>
                <div>
                  <Tag color="cyan">Review System</Tag>
                  <Text>ระบบรีวิวและความคิดเห็น</Text>
                </div>
                <div>
                  <Tag color="magenta">Notification</Tag>
                  <Text>ระบบแจ้งเตือนและประกาศ</Text>
                </div>
                <div>
                  <Tag color="volcano">Analytics</Tag>
                  <Text>ระบบวิเคราะห์และรายงาน</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          <Col xs={24} sm={12} md={8}>
            <Link href="/test-db">
              <Button 
                type="primary" 
                icon={<DatabaseOutlined />} 
                size="large" 
                block
              >
                ทดสอบ Database
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Link href="/test-antd">
              <Button 
                icon={<ExperimentOutlined />} 
                size="large" 
                block
              >
                ทดสอบ Ant Design
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              icon={<RocketOutlined />} 
              size="large" 
              block
              disabled
            >
              เริ่มพัฒนาระบบ
            </Button>
          </Col>
        </Row>

        {/* Database Schema Info */}
        <Card title="Database Schema" style={{ marginBottom: 24 }}>
          <Paragraph>
            ระบบได้ถูกออกแบบด้วย <Text strong>30+ Models</Text> ที่ครอบคลุมทุกฟีเจอร์ของระบบ E-Learning:
          </Paragraph>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Text strong>User Management:</Text>
              <br />
              <Text type="secondary">Users, Social Login, Sessions</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Content Management:</Text>
              <br />
              <Text type="secondary">Categories, Subjects, Articles</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Course System:</Text>
              <br />
              <Text type="secondary">Courses, Chapters, Lessons</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Exam Repository:</Text>
              <br />
              <Text type="secondary">Exam Types, Sets, Questions</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Payment System:</Text>
              <br />
              <Text type="secondary">Orders, Receipts, Promotions</Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Analytics:</Text>
              <br />
              <Text type="secondary">Progress, Reviews, Logs</Text>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#666' }}>
          <Text>
            พร้อมเริ่มพัฒนาระบบ E-Learning ที่สมบูรณ์แบบ 🚀
          </Text>
        </div>
      </div>
    </div>
  )
}