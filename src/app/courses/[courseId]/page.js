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
  App
} from "antd";
import { 
  ArrowLeftOutlined, 
  PlayCircleOutlined, 
  FilePdfOutlined, 
  LinkOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

async function getCourse(courseId) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/courses/${courseId}`, { cache: 'no-store' });
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

// VideoPlayerWithError: แบบ auto-track progress
function VideoPlayerWithError({ url, onVideoCompleted }) {
  let embedUrl = url;
  
  // YouTube: convert to embed
  if (/youtube\.com\/watch\?v=/.test(url)) {
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) embedUrl = `https://www.youtube.com/embed/${vMatch[1]}?enablejsapi=1`;
  } else if (/youtube\.com\/playlist\?list=/.test(url)) {
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) embedUrl = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
  } else if (/loom\.com\/share\//.test(url)) {
    embedUrl = url.replace('/share/', '/embed/').replace('?sid=', '?');
  }

  // Track video completion (simplified)
  useEffect(() => {
    // Auto-mark as completed after 30 seconds (placeholder logic)
    const timer = setTimeout(() => {
      if (onVideoCompleted) {
        onVideoCompleted();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [url, onVideoCompleted]);
  
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
      <div style={{ color: '#fff', fontSize: 12, padding: 4 }}>
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
  const { courseId } = React.use(params);
  const { message } = App.useApp(); // ใช้ App context
  
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
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

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

  // Fetch enrollment info และสร้าง enrollment ใหม่หากยังไม่มี
  useEffect(() => {
    if (!userId || !courseId) return;
    
    const fetchOrCreateEnrollment = async () => {
      setEnrollLoading(true);
      try {
        // ลองดึง enrollment ที่มีอยู่
        let res = await fetch(`/api/enrollments?userId=${userId}&courseId=${courseId}`);
        let data = await res.json();
        
        if (!data.enrollment) {
          // ถ้าไม่มี enrollment ให้สร้างใหม่
          console.log('Creating new enrollment...');
          res = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId }),
          });
          data = await res.json();
          
          if (data.enrollment) {
            message.info('ยินดีต้อนรับสู่คอร์สนี้!');
          }
        }
        
        setEnrollment(data.enrollment);
      } catch (error) {
        console.error('Failed to fetch/create enrollment:', error);
        // ถ้า API ไม่ทำงาน ให้สร้าง mock enrollment
        setEnrollment({
          id: 'mock',
          userId,
          courseId,
          progress: 0,
          status: 'ACTIVE',
          viewedContentIds: []
        });
      } finally {
        setEnrollLoading(false);
      }
    };
    
    fetchOrCreateEnrollment();
  }, [userId, courseId]);

  // Handler for selecting content
  const handleSelectContent = (chapter, content) => {
    setSelectedChapter(chapter);
    setSelectedContent(content);
  };

  // ฟังก์ชัน auto mark content เมื่อดูครบ (สำหรับ video)
  const handleContentViewed = async (contentId) => {
    if (!userId || !courseId || !enrollment) return;
    
    const currentViewed = new Set(enrollment.viewedContentIds || []);
    if (currentViewed.has(contentId)) return; // เคยดูแล้ว
    
    currentViewed.add(contentId);
    const progress = Math.min(100, Math.round((currentViewed.size / totalContents) * 100));
    
    try {
      const res = await fetch('/api/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          courseId, 
          progress, 
          viewedContentIds: Array.from(currentViewed) 
        }),
      });
      
      const data = await res.json();
      if (data.enrollment) {
        setEnrollment(data.enrollment);
        message.success(`บันทึกความคืบหน้า: เรียนจบเนื้อหานี้แล้ว (${progress}%)`);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
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
        {/* Sidebar: Course Contents */}
        <Col xs={24} md={10} lg={8} xl={6}>
          <Card title={course.title} style={{ marginBottom: 16 }}>
            {/* Progress Overview - แสดงเสมอ */}
            <div style={{ marginBottom: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
              <Text strong>ความคืบหน้าการเรียน</Text>
              {enrollLoading ? (
                <div style={{ marginTop: 8 }}>
                  <Spin size="small" /> กำลังโหลด...
                </div>
              ) : (
                <>
                  <Progress 
                    percent={enrollment?.progress || 0} 
                    size="small" 
                    strokeColor="#52c41a"
                    style={{ marginTop: 8 }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    เรียนจบแล้ว: {enrollment?.viewedContentIds?.length || 0}/{totalContents} รายการ
                    {!enrollment && !enrollLoading && (
                      <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                        (จะเริ่มบันทึกความคืบหน้าเมื่อเริ่มดูเนื้อหา)
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {chaptersWithContents.length === 0 ? (
              <Empty description="ยังไม่มีบทเรียน" />
            ) : (
              <Collapse defaultActiveKey={chaptersWithContents.map((_, index) => index.toString())}>
                {chaptersWithContents.map((chapter, chapterIndex) => {
                  const completedInChapter = chapter.contents.filter(content => 
                    isContentCompleted(content.id)
                  ).length;
                  
                  return (
                    <Panel
                      header={
                        <Space>
                          <Badge count={chapterIndex + 1} style={{ backgroundColor: '#1890ff' }} />
                          <Text strong>{chapter.title}</Text>
                          <Tag color={completedInChapter === chapter.contents.length ? 'green' : 'default'}>
                            {completedInChapter}/{chapter.contents.length}
                          </Tag>
                        </Space>
                      }
                      key={chapterIndex.toString()}
                    >
                      <List
                        itemLayout="horizontal"
                        dataSource={chapter.contents}
                        renderItem={(content) => {
                          const isCompleted = isContentCompleted(content.id);
                          return (
                            <List.Item
                              key={content.id}
                              style={{
                                background: selectedContent?.id === content.id ? "#e6f7ff" : 
                                           isCompleted ? "#f6ffed" : "transparent",
                                borderRadius: 6,
                                cursor: "pointer",
                                marginBottom: 4,
                                padding: 8,
                                border: isCompleted ? "1px solid #b7eb8f" : "none"
                              }}
                              onClick={() => handleSelectContent(chapter, content)}
                            >
                              <List.Item.Meta
                                avatar={
                                  <div style={{ position: 'relative' }}>
                                    {getContentIcon(content.contentType)}
                                    {isCompleted && (
                                      <CheckCircleOutlined 
                                        style={{ 
                                          position: 'absolute', 
                                          top: -5, 
                                          right: -5, 
                                          color: '#52c41a', 
                                          fontSize: 12,
                                          background: 'white',
                                          borderRadius: '50%'
                                        }} 
                                      />
                                    )}
                                  </div>
                                }
                                title={
                                  <span style={{ 
                                    fontWeight: 500,
                                    color: isCompleted ? '#52c41a' : 'inherit',
                                    textDecoration: isCompleted ? 'line-through' : 'none'
                                  }}>
                                    {content.title}
                                  </span>
                                }
                                description={
                                  <Space>
                                    <Tag color={getContentTypeColor(content.contentType)}>
                                      {content.contentType}
                                    </Tag>
                                    {isCompleted && <Tag color="success">เรียนจบแล้ว</Tag>}
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
                {selectedContent.contentType === "VIDEO" && selectedContent.contentUrl && (
                  <VideoPlayerWithError 
                    url={selectedContent.contentUrl} 
                    onVideoCompleted={() => handleContentViewed(selectedContent.id)}
                  />
                )}
                
                {selectedContent.contentType === "PDF" && selectedContent.contentUrl && (
                  <div>
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      href={selectedContent.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => handleContentViewed(selectedContent.id), 5000)}
                    >
                      เปิดไฟล์ PDF
                    </Button>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      จะบันทึกความคืบหน้าอัตโนมัติหลังเปิดไฟล์ 5 วินาที
                    </div>
                  </div>
                )}
                
                {selectedContent.contentType === "LINK" && selectedContent.contentUrl && (
                  <div>
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={selectedContent.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: 0 }}
                      onClick={() => setTimeout(() => handleContentViewed(selectedContent.id), 3000)}
                    >
                      {selectedContent.contentUrl}
                    </Button>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      จะบันทึกความคืบหน้าอัตโนมัติหลังคลิกลิงก์ 3 วินาที
                    </div>
                  </div>
                )}
                
                {selectedContent.contentType === "FILE" && selectedContent.contentUrl && (
                  <div style={{ 
                    margin: '24px 0', 
                    padding: 16, 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: 8 
                  }}>
                    <Title level={4} style={{ margin: 0 }}>ไฟล์แนบ</Title>
                    <a 
                      href={selectedContent.contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: 16, color: '#389e0d', fontWeight: 500 }}
                      onClick={() => setTimeout(() => handleContentViewed(selectedContent.id), 3000)}
                    >
                      ดาวน์โหลดไฟล์ / เปิดไฟล์
                    </a>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      จะบันทึกความคืบหน้าอัตโนมัติหลังคลิกดาวน์โหลด 3 วินาที
                    </div>
                  </div>
                )}
                
                {(selectedContent.contentType === "QUIZ" || selectedContent.contentType === "ASSIGNMENT") && (
                  <Card
                    size="small"
                    style={{
                      backgroundColor: "#fff7e6",
                      border: "1px solid #ffd591",
                    }}
                  >
                    <Text type="secondary">
                      {selectedContent.contentType === "QUIZ" ? "แบบทดสอบ" : "งานที่มอบหมาย"} {" "}
                      จะเปิดให้ทำในอนาคต
                    </Text>
                  </Card>
                )}
                
                {/* ปุ่มเรียนจบเนื้อหานี้ Manual */}
                {enrollment && enrollment.status === 'ACTIVE' && selectedContent && (
                  <div style={{ marginTop: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>สถานะการเรียน:</Text>
                      {isContentCompleted(selectedContent.id) ? (
                        <Tag color="success" style={{ marginLeft: 8 }}>เรียนจบแล้ว</Tag>
                      ) : (
                        <Tag color="processing" style={{ marginLeft: 8 }}>กำลังเรียน</Tag>
                      )}
                    </div>
                    
                    {!isContentCompleted(selectedContent.id) && (
                      <Button
                        type="primary"
                        onClick={handleMarkContentDone}
                        icon={<CheckCircleOutlined />}
                      >
                        บันทึกว่าเรียนจบเนื้อหานี้แล้ว
                      </Button>
                    )}
                  </div>
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