'use client'

import { useState, useEffect } from 'react'
import { 
  Button, 
  Card, 
  Alert, 
  Typography, 
  Space, 
  Row, 
  Col,
  Spin,
  message
} from 'antd'
import {
  DatabaseOutlined,
  UserAddOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function TestDBPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(data)
      if (data.success) {
        message.success('เชื่อมต่อ database สำเร็จ!')
      }
    } catch (err) {
      setError(err.message)
      message.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          role: 'student'
        })
      })
      const data = await response.json()
      setResult(data)
      if (data.success) {
        message.success('สร้างผู้ใช้ทดสอบสำเร็จ!')
      }
    } catch (err) {
      setError(err.message)
      message.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setResult(data)
      if (data.success) {
        message.success(`พบผู้ใช้ทั้งหมด ${data.data.users.length} คน`)
      }
    } catch (err) {
      setError(err.message)
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      setResult(data)
      if (data.success) {
        message.success(`พบคอร์สทั้งหมด ${data.data.courses.length} คอร์ส`)
      }
    } catch (err) {
      setError(err.message)
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1}>
          <DatabaseOutlined /> ทดสอบ Prisma + PostgreSQL
        </Title>
        
        <Alert
          message="ระบบ Database พร้อมใช้งาน"
          description="Prisma ORM เชื่อมต่อกับ PostgreSQL บน Prisma Cloud"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<DatabaseOutlined />}
              loading={loading}
              onClick={testConnection}
              block
              size="large"
            >
              ทดสอบการเชื่อมต่อ
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<UserAddOutlined />}
              loading={loading}
              onClick={createTestUser}
              block
              size="large"
            >
              สร้างผู้ใช้ทดสอบ
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<TeamOutlined />}
              loading={loading}
              onClick={fetchUsers}
              block
              size="large"
            >
              ดูรายการผู้ใช้
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<BookOutlined />}
              loading={loading}
              onClick={fetchCourses}
              block
              size="large"
            >
              ดูรายการคอร์ส
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {result && (
          <Card 
            title={
              <Space>
                {result.success ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                )}
                <Text strong>ผลลัพธ์การทดสอบ</Text>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>กำลังประมวลผล...</Text>
                </div>
              </div>
            ) : (
              <pre style={{ 
                background: '#f6f8fa', 
                padding: '16px', 
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
                lineHeight: '1.5'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </Card>
        )}

        <Card title="ข้อมูล Login ที่มีอยู่" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text><Text strong>Admin:</Text> admin@physics.com / admin123</Text>
            <Text><Text strong>Teacher:</Text> teacher@physics.com / teacher123</Text>
            <Text><Text strong>Student:</Text> student@physics.com / student123</Text>
          </Space>
        </Card>
      </div>
    </div>
  )
}