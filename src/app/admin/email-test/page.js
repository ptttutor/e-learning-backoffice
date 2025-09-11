"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Divider, 
  Tag,
  Descriptions,
  Spin,
  message,
  Row,
  Col
} from 'antd';
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/test/email');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error checking email config:', error);
      message.error('เกิดข้อผิดพลาดในการตรวจสอบการตั้งค่า');
    }
  };

  const testEmail = async (type, orderIdSuffix = '') => {
    setLoading(true);
    const orderId = `test-${type}-${Date.now()}${orderIdSuffix}`;
    
    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, orderId }),
      });

      const data = await response.json();
      
      const result = {
        type,
        timestamp: new Date(),
        success: data.success,
        message: data.message || data.error,
        messageId: data.messageId,
        details: data.details
      };

      setResults(prev => [result, ...prev]);

      if (data.success) {
        message.success(`ส่ง email ทดสอบ ${type} สำเร็จ`);
      } else {
        message.error(`ส่ง email ทดสอบ ${type} ไม่สำเร็จ: ${data.error}`);
      }
    } catch (error) {
      const result = {
        type,
        timestamp: new Date(),
        success: false,
        message: error.message,
        details: error.toString()
      };
      
      setResults(prev => [result, ...prev]);
      message.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success) => {
    return success ? 
      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getTypeText = (type) => {
    const types = {
      'success': '✅ ชำระเงินสำเร็จ',
      'failure': '❌ ชำระเงินไม่สำเร็จ',
      'custom': '🧪 Email ทั่วไป'
    };
    return types[type] || type;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <MailOutlined /> ระบบทดสอบ Email Notification
      </Title>
      
      <Paragraph>
        ใช้หน้านี้เพื่อทดสอบการส่ง email แจ้งเตือนสำหรับการชำระเงินในระบบ
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          {/* การตั้งค่า Email */}
          <Card 
            title={
              <span>
                <SettingOutlined /> การตั้งค่า Email
              </span>
            }
            extra={
              <Button 
                size="small" 
                onClick={checkEmailConfig}
                icon={<InfoCircleOutlined />}
              >
                ตรวจสอบ
              </Button>
            }
          >
            {config ? (
              <>
                <Alert
                  message={
                    config.configured 
                      ? "การตั้งค่า Email พร้อมใช้งาน" 
                      : "การตั้งค่า Email ไม่สมบูรณ์"
                  }
                  type={config.configured ? "success" : "warning"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Email User">
                    {config.config.hasEmailUser ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> {config.config.emailUser}
                      </Tag>
                    ) : (
                      <Tag color="red">
                        <CloseCircleOutlined /> ไม่ได้ตั้งค่า
                      </Tag>
                    )}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Email Password">
                    {config.config.hasEmailPassword ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> ตั้งค่าแล้ว
                      </Tag>
                    ) : (
                      <Tag color="red">
                        <CloseCircleOutlined /> ไม่ได้ตั้งค่า
                      </Tag>
                    )}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Admin Email">
                    {config.config.hasAdminEmail ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> {config.config.adminEmail}
                      </Tag>
                    ) : (
                      <Tag color="red">
                        <CloseCircleOutlined /> ไม่ได้ตั้งค่า
                      </Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {!config.configured && (
                  <Alert
                    message="การตั้งค่าที่ขาดหายไป"
                    description={
                      <div>
                        กรุณาตั้งค่า environment variables ต่อไปนี้ในไฟล์ .env.local:
                        <ul style={{ marginTop: 8, marginBottom: 0 }}>
                          {!config.config.hasEmailUser && <li>EMAIL_USER</li>}
                          {!config.config.hasEmailPassword && <li>EMAIL_PASSWORD</li>}
                          {!config.config.hasAdminEmail && <li>ADMIN_EMAIL</li>}
                        </ul>
                      </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            ) : (
              <Spin />
            )}
          </Card>

          {/* การทดสอบ Email */}
          <Card 
            title={
              <span>
                <ExperimentOutlined /> ทดสอบการส่ง Email
              </span>
            }
            style={{ marginTop: 24 }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>ทดสอบ Email ประเภทต่าง ๆ:</Text>
              </div>
              
              <Space wrap>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => testEmail('success')}
                  loading={loading}
                  disabled={!config?.configured}
                >
                  ชำระเงินสำเร็จ
                </Button>
                
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => testEmail('failure')}
                  loading={loading}
                  disabled={!config?.configured}
                >
                  ชำระเงินไม่สำเร็จ
                </Button>
                
                <Button
                  icon={<MailOutlined />}
                  onClick={() => testEmail('custom')}
                  loading={loading}
                  disabled={!config?.configured}
                >
                  Email ทั่วไป
                </Button>
              </Space>

              {!config?.configured && (
                <Alert
                  message="ไม่สามารถทดสอบได้"
                  description="กรุณาตั้งค่า email configuration ให้ครบถ้วนก่อน"
                  type="warning"
                  showIcon
                  size="small"
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* ผลการทดสอบ */}
          <Card 
            title={
              <span>
                <InfoCircleOutlined /> ผลการทดสอบ
              </span>
            }
            extra={
              results.length > 0 && (
                <Button 
                  size="small" 
                  onClick={() => setResults([])}
                >
                  ล้างผลลัพธ์
                </Button>
              )
            }
          >
            {results.length === 0 ? (
              <Alert
                message="ยังไม่มีการทดสอบ"
                description="คลิกปุ่มทดสอบเพื่อตรวจสอบการส่ง email"
                type="info"
                showIcon
              />
            ) : (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {results.map((result, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{
                      border: `1px solid ${result.success ? '#52c41a' : '#ff4d4f'}`,
                      borderRadius: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getStatusIcon(result.success)}
                      <Text strong>{getTypeText(result.type)}</Text>
                      <Tag size="small" color="default">
                        {result.timestamp.toLocaleTimeString('th-TH')}
                      </Tag>
                    </div>
                    
                    <div style={{ marginTop: 8 }}>
                      <Text 
                        type={result.success ? 'success' : 'danger'}
                        style={{ fontSize: '12px' }}
                      >
                        {result.message}
                      </Text>
                    </div>
                    
                    {result.messageId && (
                      <div style={{ marginTop: 4 }}>
                        <Text code style={{ fontSize: '11px' }}>
                          ID: {result.messageId}
                        </Text>
                      </div>
                    )}
                  </Card>
                ))}
              </Space>
            )}
          </Card>

          {/* คำแนะนำ */}
          <Card 
            title="📚 คำแนะนำการใช้งาน"
            style={{ marginTop: 24 }}
          >
            <Space direction="vertical" size="small">
              <div>
                <Text strong>1. ตรวจสอบการตั้งค่า</Text>
                <br />
                <Text type="secondary">
                  ตรวจสอบว่าได้ตั้งค่า EMAIL_USER, EMAIL_PASSWORD และ ADMIN_EMAIL ใน .env แล้ว
                </Text>
              </div>
              
              <Divider style={{ margin: '8px 0' }} />
              
              <div>
                <Text strong>2. ทดสอบการส่ง Email</Text>
                <br />
                <Text type="secondary">
                  ใช้ปุ่มทดสอบเพื่อส่ง email ไปยังอีเมล admin
                </Text>
              </div>
              
              <Divider style={{ margin: '8px 0' }} />
              
              <div>
                <Text strong>3. ตรวจสอบ Email</Text>
                <br />
                <Text type="secondary">
                  ตรวจสอบอีเมลในกล่องจดหมายของ admin (อาจอยู่ในโฟลเดอร์ Spam)
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
