"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Typography,
  Card,
  Tag,
  Space,
  Divider,
  Button,
  Image,
  Spin,
  Alert,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`);
      const result = await response.json();

      if (result.success) {
        setPost(result.data);
      } else {
        setError(result.error || "ไม่พบโพสต์ที่ต้องการ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}
      >
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "24px" }}
        />
        <Link href="/">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}
      >
        <Alert
          message="ไม่พบโพสต์"
          description="ไม่พบโพสต์ที่คุณต้องการ"
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
        />
        <Link href="/">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "24px" }}>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>กลับหน้าหลัก</Button>
          </Link>
        </div>

        {/* Post Content */}
        <Card
          style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {/* Featured Image */}
          {post.imageUrl && (
            <div style={{ marginBottom: "32px" }}>
              <Image
                src={post.imageUrl}
                alt={post.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
              />
            </div>
          )}

          {/* Post Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ marginBottom: "16px" }}>
              <Tag
                color="blue"
                style={{
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}
              >
                {post.postType?.name || "ข่าวสาร"}
              </Tag>
              {post.isFeatured && (
                <Tag
                  color="gold"
                  style={{
                    fontSize: "14px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    marginLeft: "8px",
                  }}
                >
                  ⭐ แนะนำ
                </Tag>
              )}
            </div>

            <Title
              level={1}
              style={{
                marginBottom: "24px",
                color: "#1a202c",
                lineHeight: 1.3,
              }}
            >
              {post.title}
            </Title>

            <Space size="large" wrap>
              <Space>
                <CalendarOutlined style={{ color: "#64748b" }} />
                <Text style={{ color: "#64748b" }}>
                  {formatDate(post.publishedAt)}
                </Text>
              </Space>
              <Space>
                <UserOutlined style={{ color: "#64748b" }} />
                <Text style={{ color: "#64748b" }}>
                  {post.author?.name || "ผู้ดูแลระบบ"}
                </Text>
              </Space>
            </Space>
          </div>

          <Divider />

          {/* Post Content */}
          <div
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              color: "#374151",
            }}
          >
            {post.excerpt && (
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "32px",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <Text
                  style={{
                    fontSize: "18px",
                    fontStyle: "italic",
                    color: "#475569",
                  }}
                >
                  {post.excerpt}
                </Text>
              </div>
            )}

            {post.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  "& p": { marginBottom: "16px" },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    marginTop: "32px",
                    marginBottom: "16px",
                    color: "#1a202c",
                  },
                  "& ul, & ol": {
                    marginBottom: "16px",
                    paddingLeft: "24px",
                  },
                  "& li": { marginBottom: "8px" },
                  "& blockquote": {
                    borderLeft: "4px solid #e2e8f0",
                    paddingLeft: "16px",
                    margin: "24px 0",
                    fontStyle: "italic",
                    color: "#64748b",
                  },
                }}
              />
            ) : (
              <Paragraph style={{ fontSize: "16px", color: "#64748b" }}>
                ไม่มีเนื้อหาเพิ่มเติม
              </Paragraph>
            )}
          </div>
        </Card>

        {/* Back to Home */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/">
            <Button type="primary" size="large" icon={<ArrowLeftOutlined />}>
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
