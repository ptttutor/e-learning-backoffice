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
  Modal,
  Result,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

async function getCourse(id) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/courses/${id}`, {
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
      <div style={{ padding: 32, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูลคอร์ส...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Empty description="ไม่พบคอร์สที่ต้องการ" />
        <Link href="/courses">
          <Button icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }}>
            กลับหน้ารายการคอร์ส
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={1} style={{ margin: 0 }}>
                {course.title}
              </Title>

              <Paragraph style={{ fontSize: 16, color: "#666", margin: 0 }}>
                {course.description || "ไม่มีคำอธิบาย"}
              </Paragraph>

              <Space wrap>
                {course.category && (
                  <Tag color="blue">{course.category.name}</Tag>
                )}
                <Tag color="green">
                  <UserOutlined /> {course.instructor?.name || "ไม่ระบุ"}
                </Tag>
              </Space>

              <Divider />

              <div style={{ fontSize: 24, fontWeight: "bold" }}>
                {course.price ? (
                  <span style={{ color: "#1890ff" }}>
                    <DollarOutlined /> ฿{course.price.toLocaleString()}
                  </span>
                ) : (
                  <span style={{ color: "#52c41a" }}>ฟรี</span>
                )}
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          {course.price ? (
            <BuyCourseButton course={course} />
          ) : (
            <Button
              type="primary"
              size="large"
              style={{ minWidth: 200 }}
              href={`/courses/${id}/enroll`}
            >
              เข้าเรียนฟรี
            </Button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/courses">
            <Button icon={<ArrowLeftOutlined />}>กลับหน้ารายการคอร์ส</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// ปุ่มซื้อคอร์ส + Modal เลือกวิธีชำระเงิน
function BuyCourseButton({ course }) {
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [order, setOrder] = React.useState(null);
  const [payLoading, setPayLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  // ใช้ AuthContext เพื่อดึงข้อมูลผู้ใช้
  const { user, isAuthenticated } = useAuth();

  const handleBuy = async () => {
    if (!isAuthenticated || !user) {
      // ถ้าไม่ได้ login ให้ redirect ไปหน้า login
      if (router) router.push('/login?redirect=/courses/detail/' + course.id);
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/courses/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, courseId: course.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setModalOpen(true);
      } else {
        setResult({
          status: "error",
          title: "สั่งซื้อไม่สำเร็จ",
          subTitle: data.error,
        });
      }
    } catch (e) {
      setResult({
        status: "error",
        title: "เกิดข้อผิดพลาด",
        subTitle: e.message,
      });
    }
    setLoading(false);
  };

  const handlePayment = async (method) => {
    setPayLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, method }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          status: "success",
          title: "ชำระเงินสำเร็จ",
          subTitle: "คุณสามารถเข้าเรียนคอร์สนี้ได้แล้ว",
        });
      } else {
        setResult({
          status: "error",
          title: "ชำระเงินไม่สำเร็จ",
          subTitle: data.error,
        });
      }
    } catch (e) {
      setResult({
        status: "error",
        title: "เกิดข้อผิดพลาด",
        subTitle: e.message,
      });
    }
    setPayLoading(false);
  };

  return (
    <>
      <Button
        type="primary"
        size="large"
        style={{ minWidth: 200 }}
        loading={loading}
        onClick={handleBuy}
      >
        ซื้อคอร์ส
      </Button>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title="เลือกวิธีชำระเงิน"
      >
        {result ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Result
              status={result.status}
              title={result.title}
              subTitle={result.subTitle}
            />
          </div>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              block
              type="primary"
              icon={<DollarOutlined />}
              loading={payLoading}
              onClick={() => handlePayment("credit_card")}
            >
              ชำระด้วยบัตรเครดิต (mock)
            </Button>
            <Button
              block
              icon={<DollarOutlined />}
              loading={payLoading}
              onClick={() => handlePayment("promptpay")}
            >
              ชำระด้วย PromptPay (mock)
            </Button>
          </Space>
        )}
      </Modal>
    </>
  );
}
