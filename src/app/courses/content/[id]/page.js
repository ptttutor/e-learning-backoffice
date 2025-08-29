"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  Typography,
  Button,
  Space,
  Collapse,
  List,
  Tag,
  Empty,
  Badge,
  Row,
  Col,
  Spin,
  Progress,
  App,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  LinkOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

async function getCourse(courseId) {
  const res = await fetch(`/api/courses/${courseId}`, { cache: "no-store" });
  const data = await res.json();
  return data.data;
}

async function getChapters(courseId) {
  const res = await fetch(`/api/admin/chapters?courseId=${courseId}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.data || [];
}

async function getContents(chapterId) {
  const res = await fetch(`/api/admin/contents?chapterId=${chapterId}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.data || [];
}

const getContentIcon = (contentType) => {
  switch (contentType) {
    case "VIDEO":
      return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
    case "PDF":
      return <FilePdfOutlined style={{ color: "#f5222d" }} />;
    case "LINK":
      return <LinkOutlined style={{ color: "#52c41a" }} />;
    case "QUIZ":
      return <QuestionCircleOutlined style={{ color: "#fa8c16" }} />;
    case "ASSIGNMENT":
      return <EditOutlined style={{ color: "#722ed1" }} />;
    default:
      return <BookOutlined />;
  }
};

const getContentTypeColor = (contentType) => {
  switch (contentType) {
    case "VIDEO":
      return "blue";
    case "PDF":
      return "red";
    case "LINK":
      return "green";
    case "QUIZ":
      return "orange";
    case "ASSIGNMENT":
      return "purple";
    default:
      return "default";
  }
};

// VideoPlayerWithError: แบบ auto-track progress
function VideoPlayerWithError({ url, onVideoCompleted }) {
  let embedUrl = url;

  // YouTube: convert to embed
  if (/youtube\.com\/watch\?v=/.test(url)) {
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch)
      embedUrl = `https://www.youtube.com/embed/${vMatch[1]}?enablejsapi=1`;
  } else if (/youtube\.com\/playlist\?list=/.test(url)) {
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch)
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
  } else if (/loom\.com\/share\//.test(url)) {
    embedUrl = url.replace("/share/", "/embed/").replace("?sid=", "?");
  }

  // Track video completion (simplified)
  React.useEffect(() => {
    // Auto-mark as completed after 30 seconds (placeholder logic)
    const timer = setTimeout(() => {
      if (onVideoCompleted) {
        onVideoCompleted();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [url, onVideoCompleted]);

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="300"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ background: "#000" }}
        title="Video Content"
      />
      <div style={{ color: "#fff", fontSize: 12, padding: 4 }}>
        <span>URL: {embedUrl}</span>
      </div>
    </div>
  );
}

export default function CourseDetailPage({ params }) {
  return (
    <App>
      <CourseDetailContent params={params} />
    </App>
  );
}

function CourseDetailContent({ params }) {
  const { id } = React.use(params); // Changed from courseId to id
  const { message } = App.useApp();

  const [course, setCourse] = useState(null);
  const [chaptersWithContents, setChaptersWithContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContents, setTotalContents] = useState(0);

  // Track selected content
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Enrollment state
  const [enrollment, setEnrollment] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(true);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourse(id); // Changed from courseId to id
        setCourse(courseData);

        const chapters = await getChapters(id); // Changed from courseId to id
        const chaptersWithContentsData = await Promise.all(
          chapters.map(async (chapter) => {
            const contents = await getContents(chapter.id);
            return { ...chapter, contents };
          })
        );

        setChaptersWithContents(chaptersWithContentsData);
        setTotalContents(
          chaptersWithContentsData.reduce(
            (total, chapter) => total + chapter.contents.length,
            0
          )
        );

        // Auto-select first content if exists
        if (
          chaptersWithContentsData.length > 0 &&
          chaptersWithContentsData[0].contents.length > 0
        ) {
          setSelectedChapter(chaptersWithContentsData[0]);
          setSelectedContent(chaptersWithContentsData[0].contents[0]);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Changed from courseId to id

  // Fetch enrollment info และสร้าง enrollment ใหม่หากยังไม่มี
  useEffect(() => {
    if (!userId || !id) return; // Changed from courseId to id

    const fetchOrCreateEnrollment = async () => {
      setEnrollLoading(true);
      try {
        // ลองดึง enrollment ที่มีอยู่
        let res = await fetch(
          `/api/enrollments?userId=${userId}&courseId=${id}` // Changed from courseId to id
        );
        let data = await res.json();

        if (!data.enrollment) {
          // ถ้าไม่มี enrollment ให้สร้างใหม่
          console.log("Creating new enrollment...");
          res = await fetch("/api/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, courseId: id }), // Changed from courseId to id
          });
          data = await res.json();

          if (data.enrollment) {
            message.info("ยินดีต้อนรับสู่คอร์สนี้!");
          }
        }

        setEnrollment(data.enrollment);
      } catch (error) {
        console.error("Failed to fetch/create enrollment:", error);
        // ถ้า API ไม่ทำงาน ให้สร้าง mock enrollment
        setEnrollment({
          id: "mock",
          userId,
          courseId: id, // Changed from courseId to id
          progress: 0,
          status: "ACTIVE",
          viewedContentIds: [],
        });
      } finally {
        setEnrollLoading(false);
      }
    };

    fetchOrCreateEnrollment();
  }, [userId, id, message]); // Changed from courseId to id

  // Handler for selecting content
  const handleSelectContent = (chapter, content) => {
    setSelectedChapter(chapter);
    setSelectedContent(content);
  };

  // ฟังก์ชัน auto mark content เมื่อดูครบ (สำหรับ video)
  const handleContentViewed = async (contentId) => {
    if (!userId || !id || !enrollment) return; // Changed from courseId to id

    const currentViewed = new Set(enrollment.viewedContentIds || []);
    if (currentViewed.has(contentId)) return; // เคยดูแล้ว

    currentViewed.add(contentId);
    const progress = Math.min(
      100,
      Math.round((currentViewed.size / totalContents) * 100)
    );

    try {
      const res = await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId: id, // Changed from courseId to id
          progress,
          viewedContentIds: Array.from(currentViewed),
        }),
      });

      const data = await res.json();
      if (data.enrollment) {
        setEnrollment(data.enrollment);
        message.success(
          `บันทึกความคืบหน้า: เรียนจบเนื้อหานี้แล้ว (${progress}%)`
        );
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  // ฟังก์ชัน manual mark เนื้อหาที่เรียนจบ
  const handleMarkContentDone = async () => {
    if (!selectedContent) return;
    await handleContentViewed(selectedContent.id);
  };

  // เช็คว่าเนื้อหานี้เรียนจบแล้วหรือยัง
  const isContentCompleted = (contentId) => {
    return enrollment?.viewedContentIds?.includes(contentId) || false;
  };

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
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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
                กลับรายการคอร์ส
              </Button>
            </Link>
          </div>

          <Title
            level={2}
            style={{
              color: "white",
              marginBottom: "8px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <BookOutlined style={{ marginRight: 12 }} />
            {course.title}
          </Title>

          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "16px",
            }}
          >
            {course.description || "เรียนรู้ไปกับเราในคอร์สนี้"}
          </Text>
        </div>
      </div>

      {/* Content Section */}
      <div
        style={{
          background: "#f8fafc",
          padding: "24px",
          minHeight: "80vh",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            {/* Sidebar: Course Contents */}
            <Col xs={24} md={10} lg={8} xl={6}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <BookOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <span>เนื้อหาคอร์ส</span>
                  </div>
                }
                style={{
                  marginBottom: 16,
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  position: "sticky",
                  top: "24px",
                  maxHeight: "calc(100vh - 48px)",
                  overflow: "auto",
                }}
                styles={{ body: { padding: "16px" } }}
              >
                {/* Progress Overview */}
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                    borderRadius: 12,
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    <Text strong style={{ color: "#1a202c" }}>
                      ความคืบหน้าการเรียน
                    </Text>
                  </div>
                  {enrollLoading ? (
                    <div style={{ marginTop: 8 }}>
                      <Spin size="small" /> กำลังโหลด...
                    </div>
                  ) : (
                    <>
                      <Progress
                        percent={enrollment?.progress || 0}
                        size="small"
                        strokeColor={{
                          "0%": "#52c41a",
                          "100%": "#389e0d",
                        }}
                        style={{ marginTop: 8 }}
                      />
                      <div
                        style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}
                      >
                        เรียนจบแล้ว:{" "}
                        <Text strong style={{ color: "#52c41a" }}>
                          {enrollment?.viewedContentIds?.length || 0}/
                          {totalContents}
                        </Text>{" "}
                        รายการ
                        {!enrollment && !enrollLoading && (
                          <div style={{ color: "#fa8c16", marginTop: 4 }}>
                            จะเริ่มบันทึกความคืบหน้าเมื่อเริ่มดูเนื้อหา
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {chaptersWithContents.length === 0 ? (
                  <Empty
                    description="ยังไม่มีบทเรียน"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: "20px 0" }}
                  />
                ) : (
                  <Collapse
                    defaultActiveKey={chaptersWithContents.map((_, index) =>
                      index.toString()
                    )}
                    style={{ background: "transparent", border: "none" }}
                  >
                    {chaptersWithContents.map((chapter, chapterIndex) => {
                      const completedInChapter = chapter.contents.filter(
                        (content) => isContentCompleted(content.id)
                      ).length;

                      return (
                        <Panel
                          header={
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <Space>
                                <Badge
                                  count={chapterIndex + 1}
                                  style={{
                                    backgroundColor: "#1890ff",
                                    boxShadow:
                                      "0 2px 4px rgba(24, 144, 255, 0.3)",
                                  }}
                                />
                                <Text strong style={{ color: "#1a202c" }}>
                                  {chapter.title}
                                </Text>
                              </Space>
                              <Tag
                                color={
                                  completedInChapter === chapter.contents.length
                                    ? "success"
                                    : "processing"
                                }
                                style={{
                                  borderRadius: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {completedInChapter}/{chapter.contents.length}
                              </Tag>
                            </div>
                          }
                          key={chapterIndex.toString()}
                          style={{
                            marginBottom: 8,
                            background: "white",
                            borderRadius: "12px",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <List
                            itemLayout="horizontal"
                            dataSource={chapter.contents}
                            renderItem={(content) => {
                              const isCompleted = isContentCompleted(
                                content.id
                              );
                              const isSelected =
                                selectedContent?.id === content.id;
                              return (
                                <List.Item
                                  key={content.id}
                                  style={{
                                    background: isSelected
                                      ? "linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)"
                                      : isCompleted
                                      ? "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)"
                                      : "transparent",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    marginBottom: 6,
                                    padding: 12,
                                    border: isSelected
                                      ? "2px solid #1890ff"
                                      : isCompleted
                                      ? "1px solid #b7eb8f"
                                      : "1px solid transparent",
                                    transition: "all 0.3s ease",
                                    boxShadow: isSelected
                                      ? "0 4px 12px rgba(24, 144, 255, 0.15)"
                                      : "none",
                                  }}
                                  onClick={() =>
                                    handleSelectContent(chapter, content)
                                  }
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <div style={{ position: "relative" }}>
                                        <div
                                          style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: isCompleted
                                              ? "#f6ffed"
                                              : isSelected
                                              ? "#e6f7ff"
                                              : "#f5f5f5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: isCompleted
                                              ? "2px solid #52c41a"
                                              : isSelected
                                              ? "2px solid #1890ff"
                                              : "1px solid #d9d9d9",
                                          }}
                                        >
                                          {getContentIcon(content.contentType)}
                                        </div>
                                        {isCompleted && (
                                          <CheckCircleOutlined
                                            style={{
                                              position: "absolute",
                                              top: -2,
                                              right: -2,
                                              color: "#52c41a",
                                              fontSize: 14,
                                              background: "white",
                                              borderRadius: "50%",
                                            }}
                                          />
                                        )}
                                      </div>
                                    }
                                    title={
                                      <span
                                        style={{
                                          fontWeight: isSelected ? 600 : 500,
                                          color: isCompleted
                                            ? "#52c41a"
                                            : isSelected
                                            ? "#1890ff"
                                            : "#1a202c",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {content.title}
                                      </span>
                                    }
                                    description={
                                      <Space
                                        size="small"
                                        style={{ marginTop: 4 }}
                                      >
                                        <Tag
                                          color={getContentTypeColor(
                                            content.contentType
                                          )}
                                          style={{
                                            fontSize: "11px",
                                            borderRadius: "8px",
                                            margin: 0,
                                          }}
                                        >
                                          {content.contentType}
                                        </Tag>
                                        {isCompleted && (
                                          <Tag
                                            color="success"
                                            style={{
                                              fontSize: "11px",
                                              borderRadius: "8px",
                                              margin: 0,
                                            }}
                                          >
                                            เรียนจบแล้ว
                                          </Tag>
                                        )}
                                      </Space>
                                    }
                                  />
                                </List.Item>
                              );
                            }}
                          />
                        </Panel>
                      );
                    })}
                  </Collapse>
                )}
              </Card>
            </Col>

            {/* Main Content: Video/Content Display */}
            <Col xs={24} md={14} lg={16} xl={18}>
              <Card
                style={{
                  minHeight: 500,
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
                styles={{ body: { padding: "24px" } }}
              >
                {selectedContent ? (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                          padding: "20px",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Title
                          level={3}
                          style={{
                            margin: "0 0 8px 0",
                            color: "#1a202c",
                          }}
                        >
                          {selectedContent.title}
                        </Title>
                        <Space size="middle" wrap>
                          <Tag
                            color={getContentTypeColor(
                              selectedContent.contentType
                            )}
                            style={{
                              borderRadius: "12px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {getContentIcon(selectedContent.contentType)}
                            <span style={{ marginLeft: 4 }}>
                              {selectedContent.contentType}
                            </span>
                          </Tag>
                          {isContentCompleted(selectedContent.id) && (
                            <Tag
                              color="success"
                              style={{
                                borderRadius: "12px",
                                padding: "4px 12px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              <CheckCircleOutlined style={{ marginRight: 4 }} />
                              เรียนจบแล้ว
                            </Tag>
                          )}
                        </Space>
                        <div
                          style={{
                            color: "#64748b",
                            marginTop: 8,
                            fontSize: "14px",
                          }}
                        >
                          <BookOutlined style={{ marginRight: 4 }} />
                          {selectedChapter?.title}
                        </div>
                      </div>
                    </div>

                    {/* Video/Content Display */}
                    <div style={{ marginBottom: 24 }}>
                      {selectedContent.contentType === "VIDEO" &&
                        selectedContent.contentUrl && (
                          <div
                            style={{
                              borderRadius: "12px",
                              overflow: "hidden",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            }}
                          >
                            <VideoPlayerWithError
                              url={selectedContent.contentUrl}
                              onVideoCompleted={() =>
                                handleContentViewed(selectedContent.id)
                              }
                            />
                          </div>
                        )}

                      {selectedContent.contentType === "PDF" &&
                        selectedContent.contentUrl && (
                          <div
                            style={{
                              padding: "24px",
                              background:
                                "linear-gradient(135deg, #fff2e8 0%, #fef7f0 100%)",
                              border: "1px solid #ffccc7",
                              borderRadius: 12,
                              textAlign: "center",
                            }}
                          >
                            <FilePdfOutlined
                              style={{
                                fontSize: 48,
                                color: "#f5222d",
                                marginBottom: 16,
                              }}
                            />
                            <Title
                              level={4}
                              style={{ margin: "0 0 16px 0", color: "#1a202c" }}
                            >
                              ไฟล์ PDF
                            </Title>
                            <Button
                              type="primary"
                              size="large"
                              icon={<FilePdfOutlined />}
                              href={selectedContent.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                setTimeout(
                                  () =>
                                    handleContentViewed(selectedContent.id),
                                  5000
                                )
                              }
                              style={{
                                background:
                                  "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
                                borderColor: "transparent",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "16px",
                                fontWeight: "600",
                              }}
                            >
                              เปิดไฟล์ PDF
                            </Button>
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 14,
                                color: "#64748b",
                              }}
                            >
                              จะบันทึกความคืบหน้าอัตโนมัติหลังเปิดไฟล์ 5 วินาที
                            </div>
                          </div>
                        )}

                      {selectedContent.contentType === "LINK" &&
                        selectedContent.contentUrl && (
                          <div
                            style={{
                              padding: "24px",
                              background:
                                "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
                              border: "1px solid #b7eb8f",
                              borderRadius: 12,
                              textAlign: "center",
                            }}
                          >
                            <LinkOutlined
                              style={{
                                fontSize: 48,
                                color: "#52c41a",
                                marginBottom: 16,
                              }}
                            />
                            <Title
                              level={4}
                              style={{ margin: "0 0 16px 0", color: "#1a202c" }}
                            >
                              ลิงก์ภายนอก
                            </Title>
                            <Button
                              type="primary"
                              size="large"
                              icon={<LinkOutlined />}
                              href={selectedContent.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                setTimeout(
                                  () =>
                                    handleContentViewed(selectedContent.id),
                                  3000
                                )
                              }
                              style={{
                                background:
                                  "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                borderColor: "transparent",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "16px",
                                fontWeight: "600",
                              }}
                            >
                              เปิดลิงก์
                            </Button>
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 14,
                                color: "#64748b",
                              }}
                            >
                              จะบันทึกความคืบหน้าอัตโนมัติหลังคลิกลิงก์ 3 วินาที
                            </div>
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: "#94a3b8",
                                wordBreak: "break-all",
                              }}
                            >
                              {selectedContent.contentUrl}
                            </div>
                          </div>
                        )}

                      {selectedContent.contentType === "FILE" &&
                        selectedContent.contentUrl && (
                          <div
                            style={{
                              padding: "24px",
                              background:
                                "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
                              border: "1px solid #b7eb8f",
                              borderRadius: 12,
                              textAlign: "center",
                            }}
                          >
                            <FilePdfOutlined
                              style={{
                                fontSize: 48,
                                color: "#52c41a",
                                marginBottom: 16,
                              }}
                            />
                            <Title
                              level={4}
                              style={{ margin: "0 0 16px 0", color: "#1a202c" }}
                            >
                              ไฟล์แนบ
                            </Title>
                            <Button
                              type="primary"
                              size="large"
                              href={selectedContent.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                setTimeout(
                                  () =>
                                    handleContentViewed(selectedContent.id),
                                  3000
                                )
                              }
                              style={{
                                background:
                                  "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                borderColor: "transparent",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "16px",
                                fontWeight: "600",
                              }}
                            >
                              ดาวน์โหลดไฟล์ / เปิดไฟล์
                            </Button>
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 14,
                                color: "#64748b",
                              }}
                            >
                              จะบันทึกความคืบหน้าอัตโนมัติหลังคลิกดาวน์โหลด 3
                              วินาที
                            </div>
                          </div>
                        )}

                      {(selectedContent.contentType === "QUIZ" ||
                        selectedContent.contentType === "ASSIGNMENT") && (
                        <div
                          style={{
                            padding: "24px",
                            background:
                              "linear-gradient(135deg, #fff7e6 0%, #fef9f0 100%)",
                            border: "1px solid #ffd591",
                            borderRadius: 12,
                            textAlign: "center",
                          }}
                        >
                          {selectedContent.contentType === "QUIZ" ? (
                            <QuestionCircleOutlined
                              style={{
                                fontSize: 48,
                                color: "#fa8c16",
                                marginBottom: 16,
                              }}
                            />
                          ) : (
                            <EditOutlined
                              style={{
                                fontSize: 48,
                                color: "#722ed1",
                                marginBottom: 16,
                              }}
                            />
                          )}
                          <Title
                            level={4}
                            style={{ margin: "0 0 16px 0", color: "#1a202c" }}
                          >
                            {selectedContent.contentType === "QUIZ"
                              ? "แบบทดสอบ"
                              : "งานที่มอบหมาย"}
                          </Title>
                          <Text style={{ color: "#64748b", fontSize: "16px" }}>
                            จะเปิดให้ทำในอนาคต
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* ปุ่มเรียนจบเนื้อหานี้ Manual */}
                    {enrollment &&
                      enrollment.status === "ACTIVE" &&
                      selectedContent && (
                        <div
                          style={{
                            marginTop: 24,
                            padding: 20,
                            background:
                              "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 16,
                            }}
                          >
                            <div>
                              <Text strong style={{ color: "#1a202c" }}>
                                สถานะการเรียน:
                              </Text>
                              {isContentCompleted(selectedContent.id) ? (
                                <Tag
                                  color="success"
                                  style={{
                                    marginLeft: 8,
                                    borderRadius: "12px",
                                    padding: "4px 12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  <CheckCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  เรียนจบแล้ว
                                </Tag>
                              ) : (
                                <Tag
                                  color="processing"
                                  style={{
                                    marginLeft: 8,
                                    borderRadius: "12px",
                                    padding: "4px 12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  <PlayCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  กำลังเรียน
                                </Tag>
                              )}
                            </div>
                          </div>

                          {!isContentCompleted(selectedContent.id) && (
                            <Button
                              type="primary"
                              size="large"
                              onClick={handleMarkContentDone}
                              icon={<CheckCircleOutlined />}
                              style={{
                                background:
                                  "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                borderColor: "transparent",
                                borderRadius: "12px",
                                height: "48px",
                                fontSize: "16px",
                                fontWeight: "600",
                                boxShadow:
                                  "0 4px 12px rgba(82, 196, 26, 0.3)",
                              }}
                            >
                              บันทึกว่าเรียนจบเนื้อหานี้แล้ว
                            </Button>
                          )}
                        </div>
                      )}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <BookOutlined
                      style={{ fontSize: 64, color: "#94a3b8", marginBottom: 24 }}
                    />
                    <Title level={3} style={{ color: "#64748b", marginBottom: 16 }}>
                      กรุณาเลือกเนื้อหา
                    </Title>
                    <Text style={{ color: "#94a3b8", fontSize: "16px" }}>
                      เลือกบทเรียนจากเมนูด้านซ้ายเพื่อเริ่มเรียน
                    </Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}