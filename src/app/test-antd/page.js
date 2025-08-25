'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Input,
  Select,
  DatePicker,
  Switch,
  Slider,
  Rate,
  Progress,
  Tag,
  Avatar,
  Badge,
  Alert,
  Spin,
  Table,
  Pagination,
  Steps,
  Tabs,
  Modal,
  Drawer,
  notification,
  message
} from 'antd'

import {
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  BellOutlined,
  HomeOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  PrinterOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Step } = Steps
const { TabPane } = Tabs

export default function TestAntdPage() {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const showNotification = () => {
    notification.success({
      message: 'สำเร็จ!',
      description: 'การทดสอบ Ant Design เสร็จสิ้น',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    })
  }

  const showMessage = () => {
    message.success('ข้อความแสดงสำเร็จ!')
  }

  const columns = [
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'อายุ',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: 'ที่อยู่',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>แก้ไข</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>ลบ</Button>
        </Space>
      )
    }
  ]

  const data = [
    {
      key: '1',
      name: 'นาย ก',
      age: 32,
      address: 'กรุงเทพฯ'
    },
    {
      key: '2',
      name: 'นาง ข',
      age: 42,
      address: 'เชียงใหม่'
    },
    {
      key: '3',
      name: 'นางสาว ค',
      age: 32,
      address: 'ภูเก็ต'
    }
  ]

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1}>
          <BookOutlined /> ทดสอบ Ant Design Components
        </Title>
        
        <Alert
          message="ระบบพร้อมใช้งาน"
          description="Ant Design และ Icons ได้ถูกติดตั้งและตั้งค่าเรียบร้อยแล้ว"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Buttons Section */}
        <Card title="ปุ่มต่างๆ" style={{ marginBottom: 24 }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />}>เพิ่ม</Button>
            <Button icon={<EditOutlined />}>แก้ไข</Button>
            <Button danger icon={<DeleteOutlined />}>ลบ</Button>
            <Button type="dashed" icon={<SearchOutlined />}>ค้นหา</Button>
            <Button type="link" icon={<DownloadOutlined />}>ดาวน์โหลด</Button>
            <Button 
              type="primary" 
              loading={loading}
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 2000)
              }}
            >
              {loading ? 'กำลังโหลด...' : 'โหลดข้อมูล'}
            </Button>
          </Space>
        </Card>

        {/* Icons Section */}
        <Card title="ไอคอนต่างๆ" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Space direction="vertical" align="center">
                <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Text>ผู้ใช้</Text>
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" align="center">
                <BookOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <Text>หนังสือ</Text>
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" align="center">
                <PlayCircleOutlined style={{ fontSize: '24px', color: '#fa541c' }} />
                <Text>เล่น</Text>
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" align="center">
                <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <Text>ดาว</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Form Components */}
        <Card title="ฟอร์มและการป้อนข้อมูล" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Input 
                placeholder="ป้อนข้อความ" 
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Select defaultValue="option1" style={{ width: '100%' }}>
                <Option value="option1">ตัวเลือก 1</Option>
                <Option value="option2">ตัวเลือก 2</Option>
                <Option value="option3">ตัวเลือก 3</Option>
              </Select>
            </Col>
            <Col span={8}>
              <DatePicker style={{ width: '100%' }} placeholder="เลือกวันที่" />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]} align="middle">
            <Col span={6}>
              <Space>
                <Text>เปิด/ปิด:</Text>
                <Switch defaultChecked />
              </Space>
            </Col>
            <Col span={6}>
              <Space>
                <Text>คะแนน:</Text>
                <Rate defaultValue={4} />
              </Space>
            </Col>
            <Col span={12}>
              <Text>ระดับ: </Text>
              <Slider defaultValue={30} style={{ width: '200px', marginLeft: 8 }} />
            </Col>
          </Row>
        </Card>

        {/* Display Components */}
        <Card title="การแสดงผล" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Progress:</Text>
                <Progress percent={30} />
                <Progress percent={50} status="active" />
                <Progress percent={70} status="exception" />
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical">
                <Text strong>Tags:</Text>
                <div>
                  <Tag color="magenta">ฟิสิกส์</Tag>
                  <Tag color="red">คณิตศาสตร์</Tag>
                  <Tag color="volcano">เคมี</Tag>
                  <Tag color="orange">ชีววิทยา</Tag>
                </div>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical">
                <Text strong>Avatar & Badge:</Text>
                <Space>
                  <Badge count={5}>
                    <Avatar shape="square" icon={<UserOutlined />} />
                  </Badge>
                  <Badge dot>
                    <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                  </Badge>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card title="ตาราง" style={{ marginBottom: 24 }}>
          <Table columns={columns} dataSource={data} pagination={false} />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination defaultCurrent={1} total={50} />
          </div>
        </Card>

        {/* Steps */}
        <Card title="ขั้นตอน" style={{ marginBottom: 24 }}>
          <Steps current={1}>
            <Step title="เสร็จแล้ว" description="ติดตั้ง Ant Design" />
            <Step title="กำลังดำเนินการ" description="ทดสอบ Components" />
            <Step title="รอดำเนินการ" description="พัฒนาระบบ" />
          </Steps>
        </Card>

        {/* Tabs */}
        <Card title="แท็บ" style={{ marginBottom: 24 }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab={<span><HomeOutlined />หน้าแรก</span>} key="1">
              <p>เนื้อหาของแท็บหน้าแรก</p>
            </TabPane>
            <TabPane tab={<span><BookOutlined />คอร์ส</span>} key="2">
              <p>เนื้อหาของแท็บคอร์ส</p>
            </TabPane>
            <TabPane tab={<span><UserOutlined />ผู้ใช้</span>} key="3">
              <p>เนื้อหาของแท็บผู้ใช้</p>
            </TabPane>
          </Tabs>
        </Card>

        {/* Action Buttons */}
        <Card title="การทำงานต่างๆ" style={{ marginBottom: 24 }}>
          <Space wrap>
            <Button 
              type="primary" 
              icon={<BellOutlined />}
              onClick={showNotification}
            >
              แสดง Notification
            </Button>
            <Button 
              icon={<InfoCircleOutlined />}
              onClick={showMessage}
            >
              แสดง Message
            </Button>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setModalVisible(true)}
            >
              เปิด Modal
            </Button>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setDrawerVisible(true)}
            >
              เปิด Drawer
            </Button>
          </Space>
        </Card>

        {/* Modal */}
        <Modal
          title="ตัวอย่าง Modal"
          open={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
        >
          <p>นี่คือเนื้อหาใน Modal</p>
          <p>คุณสามารถใส่ฟอร์มหรือข้อมูลอื่นๆ ได้</p>
        </Modal>

        {/* Drawer */}
        <Drawer
          title="ตัวอย่าง Drawer"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <p>นี่คือเนื้อหาใน Drawer</p>
          <p>เหมาะสำหรับเมนูหรือฟอร์มด้านข้าง</p>
        </Drawer>

        {/* Loading */}
        <Card title="Loading" style={{ marginBottom: 24 }}>
          <Space>
            <Spin size="small" />
            <Spin />
            <Spin size="large" />
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </Space>
        </Card>
      </div>
    </div>
  )
}