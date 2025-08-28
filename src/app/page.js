"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Typography,
  Space,
  Tag,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/posts?postType=ข่าวสาร&limit=6");
      const result = await response.json();
      if (result.success) {
        setNewsData(result.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      // Loading complete
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "80px 24px",
          textAlign: "center",
          color: "white",
        }}
      >
        <Title
          level={1}
          style={{
            color: "white",
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "24px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          ฟิสิกส์พี่เต้ย Learning System
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "1.2rem",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          เรียนรู้ฟิสิกส์และคณิตศาสตร์อย่างสนุกสนาน
          พร้อมคอร์สคุณภาพสูงและเครื่องมือการเรียนที่ทันสมัย
        </Paragraph>

        <Space size="large" wrap>
          <Link href="/courses">
            <Button
              type="primary"
              size="large"
              icon={<BookOutlined />}
              style={{
                background: "rgba(255,255,255,0.2)",
                borderColor: "rgba(255,255,255,0.3)",
                backdropFilter: "blur(10px)",
                height: "50px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "25px",
                padding: "0 30px",
              }}
            >
              เริ่มเรียนเลย
            </Button>
          </Link>
          <Link href="/ebooks">
            <Button
              size="large"
              icon={<FileTextOutlined />}
              style={{
                background: "transparent",
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                height: "50px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "25px",
                padding: "0 30px",
              }}
            >
              หนังสือเรียน
            </Button>
          </Link>
        </Space>
      </div>

      {/* Main Content */}
      <div
        style={{
          background: "#f8fafc",
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* News Carousel Section */}
          {newsData.length > 0 && (
            <div style={{ marginBottom: "80px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <Title
                  level={2}
                  style={{
                    color: "#1a202c",
                    marginBottom: "16px",
                  }}
                >
                  ข่าวสารและประกาศ
                </Title>
                <Text
                  style={{
                    color: "#64748b",
                    fontSize: "16px",
                  }}
                >
                  อัพเดทข่าวสารล่าสุดจากทีมงาน
                </Text>
              </div>

              <Carousel
                autoplay
                dots={{ className: "custom-dots" }}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                {newsData.map((news) => (
                  <div key={news.id}>
                    <div
                      style={{
                        height: "400px",
                        background: news.imageUrl
                          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${news.imageUrl})`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          color: "white",
                          maxWidth: "800px",
                          padding: "0 40px",
                        }}
                      >
                        <Tag
                          color="gold"
                          style={{
                            marginBottom: "16px",
                            fontSize: "14px",
                            padding: "4px 12px",
                            borderRadius: "20px",
                          }}
                        >
                          {news.postType?.name || "ข่าวสาร"}
                        </Tag>
                        <Title
                          level={2}
                          style={{
                            color: "white",
                            marginBottom: "16px",
                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {news.title}
                        </Title>
                        {news.excerpt && (
                          <Paragraph
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "16px",
                              marginBottom: "24px",
                              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                            }}
                          >
                            {news.excerpt}
                          </Paragraph>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "16px",
                            marginBottom: "20px",
                          }}
                        >
                          <Space>
                            <CalendarOutlined />
                            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                              {formatDate(news.publishedAt)}
                            </Text>
                          </Space>
                          <Space>
                            <UserOutlined />
                            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                              {news.author?.name || "ผู้ดูแลระบบ"}
                            </Text>
                          </Space>
                        </div>
                        <Link href={`/post/${news.slug || news.id}`}>
                          <Button
                            type="primary"
                            icon={<RightOutlined />}
                            style={{
                              background: "rgba(255,255,255,0.2)",
                              borderColor: "rgba(255,255,255,0.3)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "20px",
                            }}
                          >
                            อ่านต่อ
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Features Section */}
          <div style={{ marginBottom: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <Title
                level={2}
                style={{
                  color: "#1a202c",
                  marginBottom: "16px",
                }}
              >
                เริ่มต้นการเรียนรู้
              </Title>
              <Text
                style={{
                  color: "#64748b",
                  fontSize: "16px",
                }}
              >
                เลือกสิ่งที่คุณสนใจและเริ่มเรียนได้เลย
              </Text>
            </div>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card
                  hoverable
                  className="feature-card"
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                  styles={{ body: { padding: "40px 30px", textAlign: "center" } }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px", color: "white" }}>
                    <BookOutlined />
                  </div>
                  <Title
                    level={3}
                    style={{ color: "white", marginBottom: "16px" }}
                  >
                    คอร์สเรียน
                  </Title>
                  <Paragraph
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      marginBottom: "30px",
                      lineHeight: 1.6,
                    }}
                  >
                    เรียนฟิสิกส์และคณิตศาสตร์ผ่านวิดีโอคุณภาพสูง
                    พร้อมแบบฝึกหัดและการบ้าน
                  </Paragraph>
                  <Link href="/courses">
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircleOutlined />}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      ดูคอร์สทั้งหมด
                    </Button>
                  </Link>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  hoverable
                  className="feature-card"
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                  }}
                  styles={{ body: { padding: "40px 30px", textAlign: "center" } }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px", color: "white" }}>
                    <BookOutlined />
                  </div>
                  <Title
                    level={3}
                    style={{ color: "white", marginBottom: "16px" }}
                  >
                    หนังสือเรียน
                  </Title>
                  <Paragraph
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      marginBottom: "30px",
                      lineHeight: 1.6,
                    }}
                  >
                    หนังสือเรียนและเอกสารประกอบการเรียน
                    ทั้งแบบดิจิทัลและแบบกระดาษ
                  </Paragraph>
                  <Link href="/ebooks">
                    <Button
                      type="primary"
                      size="large"
                      icon={<BookOutlined />}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      ดูหนังสือทั้งหมด
                    </Button>
                  </Link>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  hoverable
                  className="feature-card"
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                  }}
                  styles={{ body: { padding: "40px 30px", textAlign: "center" } }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px", color: "white" }}>
                    <FileTextOutlined />
                  </div>
                  <Title
                    level={3}
                    style={{ color: "white", marginBottom: "16px" }}
                  >
                    คลังข้อสอบ
                  </Title>
                  <Paragraph
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      marginBottom: "30px",
                      lineHeight: 1.6,
                    }}
                  >
                    ข้อสอบและแบบทดสอบจากหลากหลายแหล่ง
                    เพื่อเตรียมความพร้อมสำหรับการสอบ
                  </Paragraph>
                  <Link href="/exams">
                    <Button
                      type="primary"
                      size="large"
                      icon={<FileTextOutlined />}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      ดูข้อสอบทั้งหมด
                    </Button>
                  </Link>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Admin Section */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              color: "white",
            }}
          >
            <Title
              level={4}
              style={{
                color: "white",
                marginBottom: "16px",
              }}
            >
              สำหรับผู้ดูแลระบบ
            </Title>
            <Paragraph
              style={{
                color: "rgba(255,255,255,0.9)",
                marginBottom: "24px",
              }}
            >
              จัดการเนื้อหา คอร์สเรียน และผู้ใช้งานระบบ
            </Paragraph>
            <Link href="/admin/login">
              <Button
                type="primary"
                size="large"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.3)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  fontWeight: "600",
                }}
              >
                เข้าสู่ระบบ Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-dots .slick-dots li button {
          background: rgba(255, 255, 255, 0.5) !important;
          border-radius: 50% !important;
        }
        .custom-dots .slick-dots li.slick-active button {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
