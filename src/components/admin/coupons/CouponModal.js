import { Modal, Form, Input, Select, InputNumber, Switch, DatePicker, Row, Col, message } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function CouponModal({
  open,
  onCancel,
  onSubmit,
  initialData,
  title
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [couponType, setCouponType] = useState('PERCENTAGE');

  useEffect(() => {
    if (open) {
      if (initialData) {
        // แก้ไขข้อมูล
        setCouponType(initialData.type);
        form.setFieldsValue({
          ...initialData,
          validRange: [
            dayjs(initialData.validFrom),
            dayjs(initialData.validUntil)
          ],
          isActive: initialData.isActive
        });
      } else {
        // สร้างใหม่
        setCouponType('PERCENTAGE');
        form.resetFields();
        form.setFieldsValue({
          type: 'PERCENTAGE',
          applicableType: 'ALL',
          isActive: true,
          validRange: [dayjs(), dayjs().add(30, 'day')]
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const submitData = {
        ...values,
        validFrom: values.validRange[0].toISOString(),
        validUntil: values.validRange[1].toISOString(),
      };
      delete submitData.validRange;

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form validation error:', error);
      if (error.errorFields) {
        message.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleTypeChange = (value) => {
    setCouponType(value);
    // รีเซ็ตค่าที่เกี่ยวข้อง
    form.setFieldsValue({
      value: undefined,
      maxDiscount: undefined
    });
  };

  const validateCouponCode = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('กรุณาใส่รหัสคูปอง'));
    }
    if (value.length < 3) {
      return Promise.reject(new Error('รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร'));
    }
    if (!/^[A-Z0-9]+$/.test(value.toUpperCase())) {
      return Promise.reject(new Error('รหัสคูปองใช้ได้เฉพาะตัวอักษรและตัวเลขเท่านั้น'));
    }
    return Promise.resolve();
  };

  const validateValue = (_, value) => {
    if (value === undefined || value === null) {
      return Promise.reject(new Error('กรุณาใส่ค่าส่วนลด'));
    }
    if (couponType === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return Promise.reject(new Error('เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1-100'));
    }
    if (couponType === 'FIXED_AMOUNT' && value <= 0) {
      return Promise.reject(new Error('จำนวนเงินส่วนลดต้องมากกว่า 0'));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={800}
      confirmLoading={loading}
      
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="รหัสคูปอง"
              name="code"
              rules={[{ validator: validateCouponCode }]}
            >
              <Input
                placeholder="เช่น SAVE20, NEWUSER"
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setFieldsValue({ code: value });
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ชื่อคูปอง"
              name="name"
              rules={[{ required: true, message: 'กรุณาใส่ชื่อคูปอง' }]}
            >
              <Input placeholder="เช่น ลด 20% สำหรับสมาชิกใหม่" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="คำอธิบาย"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="อธิบายรายละเอียดคูปอง เงื่อนไข และข้อกำหนด"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ประเภทคูปอง"
              name="type"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทคูปอง' }]}
            >
              <Select onChange={handleTypeChange}>
                <Option value="PERCENTAGE">ส่วนลดเปอร์เซ็นต์ (%)</Option>
                <Option value="FIXED_AMOUNT">ส่วนลดจำนวนคงที่ (฿)</Option>
                <Option value="FREE_SHIPPING">ฟรีค่าจัดส่ง</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            {couponType !== 'FREE_SHIPPING' && (
              <Form.Item
                label={couponType === 'PERCENTAGE' ? 'เปอร์เซ็นต์ส่วนลด' : 'จำนวนเงินส่วนลด'}
                name="value"
                rules={[{ validator: validateValue }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={couponType === 'PERCENTAGE' ? 100 : undefined}
                  placeholder={couponType === 'PERCENTAGE' ? '20' : '100'}
                  suffix={couponType === 'PERCENTAGE' ? '%' : '฿'}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ยอดขั้นต่ำ (฿)"
              name="minOrderAmount"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            {couponType === 'PERCENTAGE' && (
              <Form.Item
                label="ส่วนลดสูงสุด (฿)"
                name="maxDiscount"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="ไม่จำกัด"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="จำกัดจำนวนการใช้งานทั้งหมด"
              name="usageLimit"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="ไม่จำกัด"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="จำกัดจำนวนการใช้งานต่อคน"
              name="userUsageLimit"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="ไม่จำกัด"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ขอบเขตการใช้งาน"
              name="applicableType"
              rules={[{ required: true, message: 'กรุณาเลือกขอบเขตการใช้งาน' }]}
            >
              <Select>
                <Option value="ALL">ทุกสินค้า</Option>
                <Option value="COURSE_ONLY">คอร์สเท่านั้น</Option>
                <Option value="EBOOK_ONLY">E-book เท่านั้น</Option>
                <Option value="CATEGORY">หมวดหมู่ที่กำหนด</Option>
                <Option value="SPECIFIC_ITEM">สินค้าที่กำหนด</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="สถานะ"
              name="isActive"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="เปิดใช้งาน" 
                unCheckedChildren="ปิดใช้งาน"
                style={{ marginTop: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="ช่วงเวลาที่ใช้ได้"
          name="validRange"
          rules={[{ required: true, message: 'กรุณาเลือกช่วงเวลาที่ใช้ได้' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
