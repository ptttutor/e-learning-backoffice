"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Card,
  Typography,
  Button,
  Space,
  Collapse,
  List,
  Tag,
  Divider,
  Empty,
  Badge,
  Row,
  Col,
  Spin,
} from "antd";
import { FilePdfOutlined, LinkOutlined, PlayCircleOutlined, QuestionCircleOutlined, EditOutlined, BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Helper functions
async function getCourse(courseId) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/courses/${courseId}`, { cache: 'no-store' });
  const data = await res.json();
  return data.data;
}
async function getChapters(courseId) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/chapters?courseId=${courseId}`, { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}
async function getContents(chapterId) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/contents?chapterId=${chapterId}`, { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}
const getContentIcon = (contentType) => {
  switch (contentType) {
    case 'VIDEO': return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
    case 'PDF': return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    case 'LINK': return <LinkOutlined style={{ color: '#52c41a' }} />;
    case 'QUIZ': return <QuestionCircleOutlined style={{ color: '#fa8c16' }} />;
    case 'ASSIGNMENT': return <EditOutlined style={{ color: '#722ed1' }} />;
    default: return <BookOutlined />;
  }
};
const getContentTypeColor = (contentType) => {
  switch (contentType) {
    case 'VIDEO': return 'blue';
    case 'PDF': return 'red';
    case 'LINK': return 'green';
    case 'QUIZ': return 'orange';
    case 'ASSIGNMENT': return 'purple';
    default: return 'default';
  }
};
// VideoPlayerWithError: Always use iframe for all video URLs
function VideoPlayerWithError({ url }) {
  let embedUrl = url;
  // YouTube: convert to embed
  if (/youtube\.com\/watch\?v=/.test(url)) {
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) embedUrl = `https://www.youtube.com/embed/${vMatch[1]}`;
  } else if (/youtube\.com\/playlist\?list=/.test(url)) {
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) embedUrl = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
  } else if (/loom\.com\/share\//.test(url)) {
    embedUrl = url.replace('/share/', '/embed/').replace('?sid=', '?');
  }
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden', backgroundColor: '#000' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="300"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ background: '#000' }}
        title="Video Content"
      />
      <div style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
        <span>URL: {embedUrl}</span>
      </div>
    </div>
  );
}
export default function CourseDetailPage({ params }) {
  const { courseId } = React.use(params);
  const [course, setCourse] = useState(null);
  const [chaptersWithContents, setChaptersWithContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContents, setTotalContents] = useState(0);
  // Track selected content
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourse(courseId);
        setCourse(courseData);
        const chapters = await getChapters(courseId);
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
  }, [courseId]);

  // Handler for selecting content
  const handleSelectContent = (chapter, content) => {
    setSelectedChapter(chapter);
    setSelectedContent(content);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูลคอร์ส...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Empty description="ไม่พบคอร์สที่ต้องการ" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <Row gutter={32}>
        {/* Sidebar: Chapter/Content List */}
        <Col xs={24} md={10} lg={8} xl={6}>
          <Card
            style={{
              height: "100%",
              minHeight: 500,
              overflow: "auto",
              background: "#f7f9fa",
            }}
          >
            <Title level={4} style={{ marginBottom: 16 }}>
              {course?.title}
            </Title>
            <div style={{ color: "#888", marginBottom: 16 }}>
              {course?.description}
            </div>
            {chaptersWithContents.length === 0 ? (
              <Empty description="ยังไม่มีบทเรียน" />
            ) : (
              <Collapse
                accordion
                bordered={false}
                style={{ background: "none" }}
              >
                {chaptersWithContents.map((chapter, chapterIndex) => (
                  <Panel
                    header={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <b>{chapter.title}</b>
                        </span>
                        <span style={{ color: "#888", fontSize: 12 }}>
                          {chapter.contents.length} Lessons
                        </span>
                      </div>
                    }
                    key={chapter.id}
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={chapter.contents}
                      renderItem={(content, contentIndex) => (
                        <List.Item
                          key={content.id}
                          style={{
                            background:
                              selectedContent?.id === content.id
                                ? "#e6f7ff"
                                : "transparent",
                            borderRadius: 6,
                            cursor: "pointer",
                            marginBottom: 4,
                            padding: 8,
                          }}
                          onClick={() => handleSelectContent(chapter, content)}
                        >
                          <List.Item.Meta
                            avatar={getContentIcon(content.contentType)}
                            title={
                              <span style={{ fontWeight: 500 }}>
                                {content.title}
                              </span>
                            }
                            description={
                              <Tag
                                color={getContentTypeColor(content.contentType)}
                              >
                                {content.contentType}
                              </Tag>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </Col>
        {/* Main Content: Video/Content Display */}
        <Col xs={24} md={14} lg={16} xl={18}>
          <Card style={{ minHeight: 500 }}>
            <div style={{ marginBottom: 16 }}>
              <Link href="/courses">
                <Button icon={<ArrowLeftOutlined />}>กลับรายการคอร์ส</Button>
              </Link>
            </div>
            {selectedContent ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {selectedContent.title}
                  </Title>
                  <Tag color={getContentTypeColor(selectedContent.contentType)}>
                    {selectedContent.contentType}
                  </Tag>
                  <div style={{ color: "#888", marginBottom: 8 }}>
                    {selectedChapter?.title}
                  </div>
                </div>
                {/* Video/Content Display */}
                {selectedContent.contentType === "VIDEO" &&
                  selectedContent.contentUrl && (
                    <VideoPlayerWithError url={selectedContent.contentUrl} />
                  )}
                {selectedContent.contentType === "PDF" &&
                  selectedContent.contentUrl && (
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      href={selectedContent.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      เปิดไฟล์ PDF
                    </Button>
                  )}
                {selectedContent.contentType === "LINK" &&
                  selectedContent.contentUrl && (
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={selectedContent.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: 0 }}
                    >
                      {selectedContent.contentUrl}
                    </Button>
                  )}
                {selectedContent.contentType === "FILE" && selectedContent.contentUrl && (
                  <div style={{ margin: '24px 0', padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>ไฟล์แนบ</Title>
                    <a href={selectedContent.contentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, color: '#389e0d', fontWeight: 500 }}>
                      ดาวน์โหลดไฟล์ / เปิดไฟล์
                    </a>
                  </div>
                )}
                {(selectedContent.contentType === "QUIZ" ||
                  selectedContent.contentType === "ASSIGNMENT") && (
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#fff7e6",
                      border: "1px solid #ffd591",
                    }}
                  >
                    <Text type="secondary">
                      {selectedContent.contentType === "QUIZ"
                        ? "แบบทดสอบ"
                        : "งานที่มอบหมาย"}{" "}
                      จะเปิดให้ทำในอนาคต
                    </Text>
                  </Card>
                )}
              </>
            ) : (
              <Empty description="กรุณาเลือกเนื้อหา" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
