"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Switch,
  Upload,
  Image,
} from "antd";
import {
  QuestionCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { uploadDiagnostics } from "@/lib/upload-diagnostics";
import { useMessage } from "@/hooks/useAntdApp";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function QuestionModal({
  open,
  editing,
  examId,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
  ]);
  const [questionImage, setQuestionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const questionTypes = [
    { value: "MULTIPLE_CHOICE", label: "เลือกตอบ", color: "blue" },
    { value: "TRUE_FALSE", label: "จริง/เท็จ", color: "green" },
    { value: "SHORT_ANSWER", label: "ตอบสั้น", color: "orange" },
  ];

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Validate question type specific requirements
      if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
        const validOptions = options.filter(opt => opt.text.trim());
        const correctOptions = validOptions.filter(opt => opt.isCorrect);
        
        if (validOptions.length < 2) {
          throw new Error("กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก");
        }
        
        if (correctOptions.length === 0) {
          throw new Error("กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก");
        }
        
        values.options = validOptions.map((opt, index) => ({
          optionText: opt.text.trim(),
          isCorrect: opt.isCorrect,
          order: index + 1,
        }));
      }
      
      if (questionImage) {
        values.questionImage = questionImage;
      }
      
      await onSubmit(values);
    } catch (error) {
      console.error("Validation error:", error);
      if (error.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    form.resetFields();
    setOptions([
      { id: 1, text: "", isCorrect: false },
      { id: 2, text: "", isCorrect: false },
    ]);
    setQuestionImage(null);
    setImagePreview("");
    onCancel();
  };

  // Handle question type change
  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    if (value === "TRUE_FALSE") {
      setOptions([
        { id: 1, text: "จริง", isCorrect: false },
        { id: 2, text: "เท็จ", isCorrect: false },
      ]);
    } else if (value === "MULTIPLE_CHOICE") {
      setOptions([
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
      ]);
    }
  };

  // Add option
  const addOption = () => {
    const newId = Math.max(...options.map(opt => opt.id)) + 1;
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };

  // Remove option
  const removeOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  // Update option text
  const updateOptionText = (id, text) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  // Toggle correct answer
  const toggleCorrectAnswer = (id) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
    ));
  };

  // Handle image upload
  const handleImageUpload = async (info) => {
    const { file } = info;
    
    if (file.status === 'uploading') {
      return;
    }
    
    if (file.status === 'done') {
      // File uploaded successfully
      if (info.file.response && info.file.response.success) {
        const imageUrl = info.file.response.data.url;
        setQuestionImage(imageUrl);
        setImagePreview(imageUrl);
        message.success('อัพโหลดรูปภาพสำเร็จ');
      } else {
        message.error('เกิดข้อผิดพลาดในการอัพโหลด');
      }
    } else if (file.status === 'error') {
      message.error('เกิดข้อผิดพลาดในการอัพโหลด');
    }
  };

  // Custom upload function for Vercel Blob
  const customUpload = async ({ file, onSuccess, onError }) => {
    const monitor = uploadDiagnostics.createPerformanceMonitor();
    const errorHandler = uploadDiagnostics.createErrorHandler('QuestionModal', {
      component: 'QuestionModal',
      field: 'questionImage',
      questionType: questionType
    });

    try {
      // Check file compatibility first
      const compatibilityCheck = uploadDiagnostics.checkFileCompatibility(file);
      if (!compatibilityCheck.compatible) {
        onError(new Error(compatibilityCheck.issues.join(', ')));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'question-image');

      console.log('QuestionModal Upload starting:', {
        fileName: file.name,
        fileSize: file.size,
        questionType,
        component: 'QuestionModal'
      });

      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        monitor.end();
        console.log('QuestionModal Upload success:', {
          url: result.data.url,
          compressionInfo: result.data.compressionInfo,
          performance: monitor.getMetrics(),
          questionType
        });
        
        if (result.data.compressionInfo?.wasCompressed) {
          message.info('รูปภาพถูกบีบอัดเพื่อคุณภาพที่เหมาะสม');
        }
        
        onSuccess(result, file);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('QuestionModal Upload error:', error);
      const handledError = errorHandler(error);
      onError(new Error(handledError.userMessage));
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setQuestionImage(null);
    setImagePreview("");
  };

  // Set form values when editing
  useEffect(() => {
    if (open && editing) {
      const formData = {
        questionText: editing.questionText,
        questionType: editing.questionType,
        marks: editing.marks,
        explanation: editing.explanation,
      };

      setTimeout(() => {
        form.setFieldsValue(formData);
        setQuestionType(editing.questionType);
        setImagePreview(editing.questionImage || "");
        setQuestionImage(editing.questionImage || null);
        
        if (editing.options && editing.options.length > 0) {
          const formattedOptions = editing.options.map((opt, index) => ({
            id: index + 1,
            text: opt.optionText,
            isCorrect: opt.isCorrect,
          }));
          setOptions(formattedOptions);
        }
      }, 100);
    } else if (open && !editing) {
      form.resetFields();
      setQuestionType("MULTIPLE_CHOICE");
      setOptions([
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
      ]);
      setQuestionImage(null);
      setImagePreview("");
      // Set default values
      form.setFieldsValue({
        questionType: "MULTIPLE_CHOICE",
        marks: 1,
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      title={
        <Space>
          {editing ? <EditOutlined /> : <PlusOutlined />}
          <Text strong>{editing ? "แก้ไขคำถาม" : "สร้างคำถามใหม่"}</Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
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
              name="questionText"
              label="คำถาม"
              rules={[
                { required: true, message: "กรุณากรอกคำถาม" },
                { max: 1000, message: "คำถามต้องไม่เกิน 1000 ตัวอักษร" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="กรอกคำถามที่ต้องการสอบถาม..."
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="รูปประกอบคำถาม (ไม่บังคับ)">
              <Space direction="vertical" style={{ width: "100%" }}>
                {imagePreview && (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <Image
                      src={imagePreview}
                      alt="Question"
                      width={200}
                      height={150}
                      style={{ objectFit: "cover", borderRadius: "6px" }}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        minWidth: "32px",
                        height: "32px",
                        borderRadius: "50%",
                      }}
                      onClick={handleRemoveImage}
                    />
                  </div>
                )}
                <Upload
                  name="questionImage"
                  customRequest={customUpload}
                  listType="picture"
                  maxCount={1}
                  onChange={handleImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>
                    {imagePreview ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
                  </Button>
                </Upload>
              </Space>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="questionType"
              label="ประเภทคำถาม"
              rules={[{ required: true, message: "กรุณาเลือกประเภทคำถาม" }]}
            >
              <Select 
                placeholder="เลือกประเภทคำถาม"
                onChange={handleQuestionTypeChange}
              >
                {questionTypes.map((type) => (
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
                            type.color === "orange" ? "#fa8c16" : "#d9d9d9"
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
              name="marks"
              label="คะแนน"
              rules={[
                { required: true, message: "กรุณากรอกคะแนน" },
                { type: "number", min: 1, message: "คะแนนต้องมากกว่า 0" },
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
        </Row>

        {/* ตัวเลือกคำตอบสำหรับ Multiple Choice และ True/False */}
        {(questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") && (
          <Card 
            title={
              <Space>
                <QuestionCircleOutlined />
                <Text>ตัวเลือกคำตอบ</Text>
              </Space>
            }
            size="small"
            style={{ marginBottom: "16px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {options.map((option, index) => (
                <Row key={option.id} gutter={[8, 0]} align="middle">
                  <Col flex="auto">
                    <Input
                      placeholder={`ตัวเลือกที่ ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      disabled={questionType === "TRUE_FALSE"}
                      style={{ borderRadius: "6px" }}
                    />
                  </Col>
                  <Col>
                    <Space>
                      <Switch
                        size="small"
                        checked={option.isCorrect}
                        onChange={() => toggleCorrectAnswer(option.id)}
                        checkedChildren="ถูก"
                        unCheckedChildren="ผิด"
                      />
                      {questionType === "MULTIPLE_CHOICE" && options.length > 2 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(option.id)}
                        />
                      )}
                    </Space>
                  </Col>
                </Row>
              ))}
              
              {questionType === "MULTIPLE_CHOICE" && options.length < 6 && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addOption}
                  style={{ width: "100%", borderRadius: "6px" }}
                >
                  เพิ่มตัวเลือก
                </Button>
              )}
            </Space>
          </Card>
        )}

        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              name="explanation"
              label="คำอธิบาย/เฉลย (ไม่บังคับ)"
              rules={[
                { max: 1000, message: "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="คำอธิบายเพิ่มเติมหรือเฉลยคำตอบ..."
                style={{ borderRadius: "6px" }}
              />
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
