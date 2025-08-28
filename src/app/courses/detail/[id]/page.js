"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Divider,
  Empty,
  Spin,
  Alert,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

async function getCourse(id) {
  const res = await fetch(`/api/courses/${id}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.data;
}

export default function CoursePaymentPage({ params }) {
  // รองรับทั้งกรณี params เป็น Promise (Next.js 15+) และกรณีปกติ
  let id;
  if (typeof React.use === "function" && typeof params?.then === "function") {
    const unwrapped = React.use(params);
    id = unwrapped?.id;
  } else {
    id = params?.id;
  }
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourse(id);
        setCourse(courseData);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Spin size="large" style={{ color: "white" }} />
        <div style={{ marginTop: 16, color: "white", fontSize: "16px" }}>
          กำลังโหลดข้อมูลคอร์ส...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Card
            style={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <Empty
              description={
                <div>
                  <Text style={{ fontSize: "18px", color: "#64748b" }}>
                    ไม่พบคอร์สที่ต้องการ
                  </Text>
                  <br />
                  <Text style={{ color: "#94a3b8" }}>
                    กรุณาตรวจสอบลิงก์หรือกลับไปหน้ารายการคอร์ส
                  </Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Link href="/courses">
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                size="large"
                style={{
                  marginTop: 24,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderColor: "transparent",
                  borderRadius: "12px",
                }}
              >
                กลับหน้ารายการคอร์ส
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 24px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <Link href="/courses">
              <Button
                icon={<ArrowLeftOutlined />}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                }}
              >
                กลับหน้ารายการคอร์ส
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        style={{
          background: "#f8fafc",
          padding: "40px 24px",
          minHeight: "70vh",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Row gutter={[32, 32]}>
            {/* Course Information */}
            <Col xs={24} lg={14}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  height: "100%",
                }}
                styles={{ body: { padding: "32px" } }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  {/* Course Header */}
                  <div>
                    <div style={{ marginBottom: "16px" }}>
                      <Space wrap>
                        {course.category && (
                          <Tag
                            color="blue"
                            style={{
                              borderRadius: "12px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            <BookOutlined style={{ marginRight: "4px" }} />
                            {course.category.name}
                          </Tag>
                        )}
                        <Tag
                          color="green"
                          style={{
                            borderRadius: "12px",
                            padding: "4px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          <UserOutlined style={{ marginRight: "4px" }} />
                          {course.instructor?.name || "ไม่ระบุผู้สอน"}
                        </Tag>
                        {course.duration && (
                          <Tag
                            color="orange"
                            style={{
                              borderRadius: "12px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            <ClockCircleOutlined
                              style={{ marginRight: "4px" }}
                            />
                            {course.duration} ชั่วโมง
                          </Tag>
                        )}
                      </Space>
                    </div>

                    <Title
                      level={1}
                      style={{
                        margin: "0 0 16px 0",
                        color: "#1a202c",
                        lineHeight: 1.3,
                      }}
                    >
                      {course.title}
                    </Title>

                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#64748b",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                      }}
                    >
                      {course.description || "ไม่มีคำอธิบายสำหรับคอร์สนี้"}
                    </Paragraph>
                  </div>

                  <Divider />

                  {/* Course Features */}
                  <div>
                    <Title
                      level={4}
                      style={{ color: "#1a202c", marginBottom: "16px" }}
                    >
                      สิ่งที่คุณจะได้รับ
                    </Title>
                    <Space direction="vertical" size="middle">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            marginRight: "12px",
                            fontSize: "16px",
                          }}
                        />
                        <Text>เข้าถึงเนื้อหาคอร์สตลอดชีวิต</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            marginRight: "12px",
                            fontSize: "16px",
                          }}
                        />
                        <Text>วิดีโอคุณภาพสูงและเอกสารประกอบ</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            marginRight: "12px",
                            fontSize: "16px",
                          }}
                        />
                        <Text>แบบฝึกหัดและการบ้าน</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            marginRight: "12px",
                            fontSize: "16px",
                          }}
                        />
                        <Text>ใบประกาศนียบัตรเมื่อจบคอร์ส</Text>
                      </div>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Purchase Card */}
            <Col xs={24} lg={10}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  position: "sticky",
                  top: "24px",
                }}
                styles={{ body: { padding: "32px" } }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  {/* Price Section */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      {course.price && course.price > 0 ? (
                        <span style={{ color: "#1890ff" }}>
                          ฿{course.price.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: "#52c41a" }}>ฟรี</span>
                      )}
                    </div>
                    <Text style={{ color: "#64748b", fontSize: "14px" }}>
                      {course.price && course.price > 0
                        ? "ชำระครั้งเดียว เข้าถึงตลอดชีวิต"
                        : "เข้าเรียนได้ทันที"}
                    </Text>
                  </div>

                  <Divider />

                  {/* Course Stats */}
                  <div>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#64748b" }}>ระดับ:</Text>
                        <Tag color="blue">เริ่มต้น - กลาง</Tag>
                      </div>

                      {course.duration && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#64748b" }}>ระยะเวลา:</Text>
                          <Text strong>{course.duration} ชั่วโมง</Text>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#64748b" }}>ภาษา:</Text>
                        <Text strong>ไทย</Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#64748b" }}>การเข้าถึง:</Text>
                        <Text strong>ตลอดชีวิต</Text>
                      </div>
                    </Space>
                  </div>

                  <Divider />

                  {/* Purchase Button */}
                  <BuyCourseButton course={course} />

                  {/* Additional Info */}
                  <Alert
                    message="รับประกันความพึงพอใจ"
                    description="หากไม่พอใจสามารถขอเงินคืนได้ภายใน 30 วัน"
                    type="info"
                    showIcon
                    style={{
                      borderRadius: "12px",
                      border: "none",
                      background: "#f0f9ff",
                    }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

// ปุ่มซื้อคอร์ส
function BuyCourseButton({ course }) {
  const [loading, setLoading] = React.useState(false);
  const router =
    typeof window !== "undefined"
      ? require("next/navigation").useRouter()
      : null;

  // ใช้ AuthContext เพื่อดึงข้อมูลผู้ใช้
  const { user, isAuthenticated } = useAuth();

  const handleBuy = async () => {
    if (!isAuthenticated || !user) {
      // ถ้าไม่ได้ login ให้ redirect ไปหน้า login
      if (router) router.push("/login?redirect=/courses/detail/" + course.id);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/courses/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, courseId: course.id }),
      });
      const data = await res.json();

      if (data.success) {
        // ถ้าเป็นคอร์สฟรี หรือ enrollment สำเร็จแล้ว ไปหน้า success
        if (data.data.enrollmentId) {
          if (router)
            router.push(`/order-success?orderId=${data.data.orderId}`);
        } else {
          // ถ้าเป็นคอร์สเสียเงิน ไปหน้าชำระเงิน
          if (router) router.push(`/payment/${data.data.orderId}`);
        }
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  const isFree = !course.price || course.price === 0;
  const buttonText = isFree ? "เข้าเรียนฟรี" : "ซื้อคอร์สเลย";
  const buttonIcon = isFree ? <PlayCircleOutlined /> : <ShoppingCartOutlined />;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleBuy}
        icon={buttonIcon}
        style={{
          height: "56px",
          fontSize: "18px",
          fontWeight: "600",
          borderRadius: "12px",
          background: isFree
            ? "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderColor: "transparent",
          boxShadow: isFree
            ? "0 4px 15px rgba(82, 196, 26, 0.4)"
            : "0 4px 15px rgba(102, 126, 234, 0.4)",
        }}
      >
        {buttonText}
      </Button>

      {!isAuthenticated && (
        <Text
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            display: "block",
          }}
        >
          ต้องเข้าสู่ระบบก่อนซื้อคอร์ส
        </Text>
      )}
    </Space>
  );
}
