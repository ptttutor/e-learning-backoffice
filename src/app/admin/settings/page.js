"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Switch,
  InputNumber,
  Select,
  Row,
  Col,
  message,
  Tabs,
  Divider,
  Alert,
  Upload,
  ColorPicker,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  GlobalOutlined,
  MailOutlined,
  DollarOutlined,
  SecurityScanOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      
      if (data.success) {
        const settingsObj = {};
        data.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
        form.setFieldsValue(settingsObj);
      } else {
        message.error("เกิดข้อผิดพลาดในการโหลดการตั้งค่า");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
        setSettings(values);
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(settings);
    message.info("รีเซ็ตการตั้งค่าเรียบร้อย");
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined /> ตั้งค่าระบบ
        </Title>
        <Text type="secondary">
          จัดการการตั้งค่าทั่วไปของระบบ
        </Text>
      </div>

      <Alert
        message="คำเตือน"
        description="การเปลี่ยนแปลงการตั้งค่าบางอย่างอาจส่งผลกระทบต่อการทำงานของระบบ กรุณาตรวจสอบให้แน่ใจก่อนบันทึก"
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          site_maintenance: false,
          user_registration: true,
          email_verification: true,
          auto_approve_courses: false,
          default_currency: "THB",
          max_file_size: 10,
          session_timeout: 30,
        }}
      >
        <Tabs defaultActiveKey="general" type="card">
          <TabPane
            tab={
              <span>
                <GlobalOutlined />
                ทั่วไป
              </span>
            }
            key="general"
          >
            <Card title="ข้อมูลเว็บไซต์">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="site_name"
                    label="ชื่อเว็บไซต์"
                    rules={[{ required: true, message: "กรุณากรอกชื่อเว็บไซต์" }]}
                  >
                    <Input placeholder="ฟิสิกส์พี่เต้ย" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="site_url"
                    label="URL เว็บไซต์"
                  >
                    <Input placeholder="https://physics.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="site_description"
                label="คำอธิบายเว็บไซต์"
              >
                <TextArea rows={3} placeholder="แพลตฟอร์มเรียนรู้ฟิสิกส์ออนไลน์" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="contact_email"
                    label="อีเมลติดต่อ"
                  >
                    <Input placeholder="contact@physics.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contact_phone"
                    label="เบอร์โทรติดต่อ"
                  >
                    <Input placeholder="02-xxx-xxxx" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="site_logo"
                label="โลโก้เว็บไซต์"
              >
                <Upload
                  name="logo"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>อัพโหลดโลโก้</Button>
                </Upload>
              </Form.Item>
            </Card>

            <Card title="การตั้งค่าทั่วไป" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="default_language"
                    label="ภาษาเริ่มต้น"
                  >
                    <Select>
                      <Option value="th">ไทย</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="default_timezone"
                    label="เขตเวลา"
                  >
                    <Select>
                      <Option value="Asia/Bangkok">Asia/Bangkok</Option>
                      <Option value="UTC">UTC</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="default_currency"
                    label="สกุลเงิน"
                  >
                    <Select>
                      <Option value="THB">บาท (THB)</Option>
                      <Option value="USD">ดอลลาร์ (USD)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="site_maintenance"
                    label="โหมดปิดปรุงระบบ"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="เปิด"
                      unCheckedChildren="ปิด"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="user_registration"
                    label="อนุญาตให้สมัครสมาชิก"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="อนุญาต"
                      unCheckedChildren="ไม่อนุญาต"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MailOutlined />
                อีเมล
              </span>
            }
            key="email"
          >
            <Card title="การตั้งค่าอีเมล">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtp_host"
                    label="SMTP Host"
                  >
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtp_port"
                    label="SMTP Port"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="587"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtp_username"
                    label="SMTP Username"
                  >
                    <Input placeholder="your-email@gmail.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtp_password"
                    label="SMTP Password"
                  >
                    <Input.Password placeholder="your-password" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="from_email"
                    label="อีเมลผู้ส่ง"
                  >
                    <Input placeholder="noreply@physics.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="from_name"
                    label="ชื่อผู้ส่ง"
                  >
                    <Input placeholder="ฟิสิกส์พี่เต้ย" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email_verification"
                label="ต้องยืนยันอีเมลก่อนใช้งาน"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="ต้องยืนยัน"
                  unCheckedChildren="ไม่ต้องยืนยัน"
                />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <DollarOutlined />
                การชำระเงิน
              </span>
            }
            key="payment"
          >
            <Card title="การตั้งค่าการชำระเงิน">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="payment_methods"
                    label="วิธีการชำระเงิน"
                  >
                    <Select mode="multiple" placeholder="เลือกวิธีการชำระเงิน">
                      <Option value="bank_transfer">โอนเงินผ่านธนาคาร</Option>
                      <Option value="credit_card">บัตรเครดิต</Option>
                      <Option value="promptpay">พร้อมเพย์</Option>
                      <Option value="true_wallet">TrueMoney Wallet</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="order_expiry_hours"
                    label="คำสั่งซื้อหมดอายุ (ชั่วโมง)"
                  >
                    <InputNumber
                      min={1}
                      max={168}
                      style={{ width: "100%" }}
                      placeholder="24"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="bank_account_info"
                label="ข้อมูลบัญชีธนาคาร"
              >
                <TextArea
                  rows={4}
                  placeholder="ธนาคารกสิกรไทย&#10;เลขที่บัญชี: xxx-x-xxxxx-x&#10;ชื่อบัญชี: บริษัท ฟิสิกส์พี่เต้ย จำกัด"
                />
              </Form.Item>

              <Form.Item
                name="auto_approve_payments"
                label="อนุมัติการชำระเงินอัตโนมัติ"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="อัตโนมัติ"
                  unCheckedChildren="ตรวจสอบด้วยตนเอง"
                />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SecurityScanOutlined />
                ความปลอดภัย
              </span>
            }
            key="security"
          >
            <Card title="การตั้งค่าความปลอดภัย">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="session_timeout"
                    label="หมดเวลาเซสชัน (นาที)"
                  >
                    <InputNumber
                      min={5}
                      max={1440}
                      style={{ width: "100%" }}
                      placeholder="30"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="max_login_attempts"
                    label="จำนวนครั้งที่ล็อกอินผิดได้สูงสุด"
                  >
                    <InputNumber
                      min={3}
                      max={10}
                      style={{ width: "100%" }}
                      placeholder="5"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password_min_length"
                    label="ความยาวรหัสผ่านขั้นต่ำ"
                  >
                    <InputNumber
                      min={6}
                      max={20}
                      style={{ width: "100%" }}
                      placeholder="8"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="max_file_size"
                    label="ขนาดไฟล์สูงสุด (MB)"
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: "100%" }}
                      placeholder="10"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="require_strong_password"
                    label="ต้องใช้รหัสผ่านที่แข็งแกร่ง"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="ต้องการ"
                      unCheckedChildren="ไม่ต้องการ"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enable_two_factor"
                    label="เปิดใช้งาน Two-Factor Authentication"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="เปิด"
                      unCheckedChildren="ปิด"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BgColorsOutlined />
                ธีม
              </span>
            }
            key="theme"
          >
            <Card title="การตั้งค่าธีม">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="primary_color"
                    label="สีหลัก"
                  >
                    <ColorPicker
                      showText
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="secondary_color"
                    label="สีรอง"
                  >
                    <ColorPicker
                      showText
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="default_theme"
                    label="ธีมเริ่มต้น"
                  >
                    <Select>
                      <Option value="light">สว่าง</Option>
                      <Option value="dark">มืด</Option>
                      <Option value="auto">อัตโนมัติ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="allow_theme_switch"
                    label="อนุญาตให้ผู้ใช้เปลี่ยนธีม"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="อนุญาต"
                      unCheckedChildren="ไม่อนุญาต"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="custom_css"
                label="CSS กำหนดเอง"
              >
                <TextArea
                  rows={6}
                  placeholder="/* CSS กำหนดเองของคุณ */"
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        <Divider />

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            บันทึกการตั้งค่า
          </Button>
          <Button
            onClick={handleReset}
            icon={<ReloadOutlined />}
          >
            รีเซ็ต
          </Button>
        </Space>
      </Form>
    </div>
  );
}