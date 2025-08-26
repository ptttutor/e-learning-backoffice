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
  Spin
} from "antd";
import { 
  ArrowLeftOutlined, 
  PlayCircleOutlined, 
  FilePdfOutlined, 
  LinkOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  UserOutlined,
  DollarOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => <div style={{ padding: 16, textAlign: 'center' }}>กำลังโหลดเครื่องเล่นวิดีโอ...</div>
});

// VideoPlayerWithError Component
function VideoPlayerWithError({ url }) {
  const [error, setError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    console.log('[VideoPlayerWithError] url:', url);
  }, [url]);
  if (!isClient) {
    return (
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderRadius: 6,
        padding: 16, 
        textAlign: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        กำลังโหลดเครื่องเล่นวิดีโอ...<br />
        <small style={{ color: '#888' }}>URL: {url}</small>
      </div>
    );
  }

  // Always use iframe for all video URLs
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

// Helper function to get content icon
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

// Helper function to get content type color
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

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'PUBLISHED': return 'green';
    case 'DRAFT': return 'orange';
    case 'CLOSED': return 'red';
    default: return 'default';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'PUBLISHED': return 'เผยแพร่';
    case 'DRAFT': return 'ฉบับร่าง';
    case 'CLOSED': return 'ปิด';
    default: return status;
  }
};

export default function CourseDetailPage({ params }) {
  const { courseId } = React.use(params);
  const [course, setCourse] = useState(null);
  const [chaptersWithContents, setChaptersWithContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContents, setTotalContents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourse(courseId);
        setCourse(courseData);

        const chapters = await getChapters(courseId);
        
        // Get all contents for all chapters
        const chaptersWithContentsData = await Promise.all(
          chapters.map(async (chapter) => {
            const contents = await getContents(chapter.id);
            return { ...chapter, contents };
          })
        );

        setChaptersWithContents(chaptersWithContentsData);
        setTotalContents(chaptersWithContentsData.reduce((total, chapter) => total + chapter.contents.length, 0));
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูลคอร์ส...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Empty description="ไม่พบคอร์สที่ต้องการ" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/courses">
            <Button icon={<ArrowLeftOutlined />}>
              กลับรายการคอร์ส
            </Button>
          </Link>
        </div>

        {/* Course Info Card */}
        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Title level={1} style={{ margin: 0 }}>
                    {course?.title}
                  </Title>
                  <Tag color={getStatusColor(course?.status)}>
                    {getStatusText(course?.status)}
                  </Tag>
                </div>
                
                <Paragraph style={{ fontSize: 16, color: '#666' }}>
                  {course?.description || 'ไม่มีคำอธิบาย'}
                </Paragraph>

                <Row gutter={[16, 8]}>
                  <Col>
                    <Text type="secondary">
                      <UserOutlined /> ผู้สอน: <Text strong>{course?.instructor?.name || 'ไม่ระบุ'}</Text>
                    </Text>
                  </Col>
                  {course?.category && (
                    <Col>
                      <Text type="secondary">
                        หมวดหมู่: <Text strong>{course.category.name}</Text>
                      </Text>
                    </Col>
                  )}
                </Row>
              </Space>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Space direction="vertical" size="middle">
                  <div>
                    {course?.price ? (
                      <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                        <DollarOutlined /> ฿{course.price.toLocaleString()}
                      </Title>
                    ) : (
                      <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                        ฟรี
                      </Title>
                    )}
                  </div>
                  
                  <Space size="large">
                    <div style={{ textAlign: 'center' }}>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        {chaptersWithContents.length}
                      </Title>
                      <Text type="secondary">บท</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                        {totalContents}
                      </Title>
                      <Text type="secondary">เนื้อหา</Text>
                    </div>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Chapters */}
        <Card>
          <Title level={2}>
            <BookOutlined style={{ marginRight: 8 }} />
            เนื้อหาคอร์ส
          </Title>
          
          {chaptersWithContents.length === 0 ? (
            <Empty description="ยังไม่มีบทเรียน" />
          ) : (
            <Collapse 
              defaultActiveKey={chaptersWithContents.map((_, index) => index.toString())}
              size="large"
            >
              {chaptersWithContents.map((chapter, chapterIndex) => (
                <Panel
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Space>
                        <Badge count={chapterIndex + 1} style={{ backgroundColor: '#1890ff' }} />
                        <Text strong style={{ fontSize: 16 }}>
                          {chapter.title}
                        </Text>
                      </Space>
                      <Text type="secondary">
                        {chapter.contents.length} รายการ
                      </Text>
                    </div>
                  }
                  key={chapterIndex.toString()}
                >
                  <div style={{ paddingLeft: 24 }}>
                    {chapter.contents.length === 0 ? (
                      <Empty description="ยังไม่มีเนื้อหา" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <List
                        itemLayout="vertical"
                        dataSource={chapter.contents}
                        renderItem={(content, contentIndex) => (
                          <List.Item key={content.id}>
                            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Space>
                                    {getContentIcon(content.contentType)}
                                    <Text strong>{content.title}</Text>
                                    <Tag color={getContentTypeColor(content.contentType)}>
                                      {content.contentType}
                                    </Tag>
                                  </Space>
                                  <Text type="secondary">#{contentIndex + 1}</Text>
                                </div>

                                {/* Video Player */}
                                {content.contentType === 'VIDEO' && content.contentUrl && (
                                  <VideoPlayerWithError url={content.contentUrl} />
                                )}

                                {/* PDF Link */}
                                {content.contentType === 'PDF' && content.contentUrl && (
                                  <Button 
                                    type="primary" 
                                    icon={<FilePdfOutlined />}
                                    href={content.contentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    เปิดไฟล์ PDF
                                  </Button>
                                )}

                                {/* External Link */}
                                {content.contentType === 'LINK' && content.contentUrl && (
                                  <Button 
                                    type="link" 
                                    icon={<LinkOutlined />}
                                    href={content.contentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ padding: 0 }}
                                  >
                                    {content.contentUrl}
                                  </Button>
                                )}

                                {/* Quiz/Assignment placeholder */}
                                {(content.contentType === 'QUIZ' || content.contentType === 'ASSIGNMENT') && (
                                  <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                                    <Text type="secondary">
                                      {content.contentType === 'QUIZ' ? 'แบบทดสอบ' : 'งานที่มอบหมาย'}
                                      จะเปิดให้ทำในอนาคต
                                    </Text>
                                  </Card>
                                )}
                              </Space>
                            </Card>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>
      </Space>
    </div>
  );
}