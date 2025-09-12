"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function ExamModal({
  open,
  editing,
  courseId,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const examTypes = [
    { value: "PRETEST", label: "ทดสอบก่อนเรียน", color: "blue" },
    { value: "POSTTEST", label: "ทดสอบหลังเรียน", color: "green" },
    { value: "QUIZ", label: "แบบทดสอบ", color: "orange" },
    { value: "MIDTERM", label: "สอบกลางภาค", color: "purple" },
    { value: "FINAL", label: "สอบปลายภาค", color: "red" },
    { value: "PRACTICE", label: "ฝึกทำ", color: "cyan" },
  ];

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Set form values when editing
  useEffect(() => {
    if (open && editing) {
      const formData = {
        title: editing.title,
        description: editing.description,
        examType: editing.examType,
        timeLimit: editing.timeLimit,
        totalMarks: editing.totalMarks,
        passingMarks: editing.passingMarks,
        attemptsAllowed: editing.attemptsAllowed,
        showResults: editing.showResults,
        showAnswers: editing.showAnswers,
        isActive: editing.isActive,
      };

      setTimeout(() => {
        form.setFieldsValue(formData);
      }, 100);
    } else if (open && !editing) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        examType: "QUIZ",
        totalMarks: 0,
        passingMarks: 0,
        attemptsAllowed: 1,
        showResults: true,
        showAnswers: false,
        isActive: true,
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>{editing ? "แก้ไขข้อสอบ" : "สร้างข้อสอบใหม่"}</Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      style={{ top: 20 }}
      
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="ชื่อข้อสอบ"
              rules={[
                { required: true, message: "กรุณากรอกชื่อข้อสอบ" },
                { max: 200, message: "ชื่อข้อสอบต้องไม่เกิน 200 ตัวอักษร" },
              ]}
            >
              <Input
                placeholder="เช่น แบบทดสอบก่อนเรียน บทที่ 1"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="คำอธิบาย"
              rules={[
                { max: 1000, message: "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับข้อสอบนี้"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="examType"
              label="ประเภทข้อสอบ"
              rules={[{ required: true, message: "กรุณาเลือกประเภทข้อสอบ" }]}
            >
              <Select placeholder="เลือกประเภทข้อสอบ">
                {examTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: 
                            type.color === "blue" ? "#1890ff" :
                            type.color === "green" ? "#52c41a" :
                            type.color === "orange" ? "#fa8c16" :
                            type.color === "purple" ? "#722ed1" :
                            type.color === "red" ? "#f5222d" :
                            type.color === "cyan" ? "#13c2c2" : "#d9d9d9"
                        }}
                      />
                      {type.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="timeLimit"
              label="เวลาจำกัด (นาที)"
              rules={[{ type: "number", min: 0, message: "เวลาต้องเป็นค่าบวก" }]}
            >
              <InputNumber
                placeholder="0 = ไม่จำกัดเวลา"
                style={{ width: "100%", borderRadius: "6px" }}
                min={0}
                step={1}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="totalMarks"
              label="คะแนนรวม"
              rules={[
                { required: true, message: "กรุณากรอกคะแนนรวม" },
                { type: "number", min: 0, message: "คะแนนต้องเป็นค่าบวก" },
              ]}
            >
              <InputNumber
                placeholder="100"
                style={{ width: "100%", borderRadius: "6px" }}
                min={0}
                step={1}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="passingMarks"
              label="คะแนนผ่าน"
              rules={[
                { required: true, message: "กรุณากรอกคะแนนผ่าน" },
                { type: "number", min: 0, message: "คะแนนต้องเป็นค่าบวก" },
              ]}
            >
              <InputNumber
                placeholder="60"
                style={{ width: "100%", borderRadius: "6px" }}
                min={0}
                step={1}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="attemptsAllowed"
              label="จำนวนครั้งที่ทำได้"
              rules={[
                { required: true, message: "กรุณากรอกจำนวนครั้ง" },
                { type: "number", min: 1, message: "ต้องมากกว่า 0" },
              ]}
            >
              <InputNumber
                placeholder="1"
                style={{ width: "100%", borderRadius: "6px" }}
                min={1}
                step={1}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="showResults"
              label="แสดงผลลัพธ์"
              valuePropName="checked"
            >
              <Switch checkedChildren="แสดง" unCheckedChildren="ไม่แสดง" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="showAnswers"
              label="แสดงเฉลย"
              valuePropName="checked"
            >
              <Switch checkedChildren="แสดง" unCheckedChildren="ไม่แสดง" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="isActive"
              label="เปิดใช้งาน"
              valuePropName="checked"
            >
              <Switch checkedChildren="เปิด" unCheckedChildren="ปิด" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={editing ? <EditOutlined /> : <PlusOutlined />}
            >
              {editing ? "อัพเดท" : "สร้าง"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
