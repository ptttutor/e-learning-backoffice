import { Card, Space, Typography, Descriptions, Tag, Avatar, Progress } from "antd";
import { BookOutlined, UserOutlined, ClockCircleOutlined, FileTextOutlined, PlayCircleOutlined, StarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function CourseInfoCard({ selectedOrder, formatPrice }) {
  const course = selectedOrder?.course;
  
  // ดึงชื่อคอร์สจาก items array ก่อน หากไม่มีค่อยใช้จาก course object
  const courseTitle = selectedOrder.items && selectedOrder.items.length > 0 
    ? selectedOrder.items.find(item => item.itemType === "COURSE")?.title || course?.title
    : course?.title;
  
  if (!course) return null;

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>รายละเอียดคอร์ส: {courseTitle}</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="ชื่อคอร์ส" span={2}>
          <Text strong>{courseTitle}</Text>
        </Descriptions.Item>
        
        {course.description && (
          <Descriptions.Item label="คำอธิบาย" span={2}>
            <Text>{course.description}</Text>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="อาจารย์ผู้สอน">
          <Space>
            <Avatar 
              src={course.instructor?.image} 
              icon={<UserOutlined />} 
              size="small" 
            />
            <Text>{course.instructor?.name}</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="หมวดหมู่">
          {course.category ? (
            <Tag color="blue">{course.category.name}</Tag>
          ) : (
            <Text type="secondary">ไม่ระบุ</Text>
          )}
        </Descriptions.Item>

        {course.duration && (
          <Descriptions.Item label="ระยะเวลา">
            <Space>
              <ClockCircleOutlined style={{ color: "#52c41a" }} />
              <Text>{course.duration} นาที</Text>
            </Space>
          </Descriptions.Item>
        )}

        {course.accessDuration && (
          <Descriptions.Item label="ระยะเวลาเข้าถึง">
            <Text>{course.accessDuration} วัน</Text>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="ราคา">
          <Space>
            <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
              {formatPrice(course.price)}
            </Text>
            {course.discountPrice && course.discountPrice < course.price && (
              <>
                <Text delete type="secondary">
                  {formatPrice(course.price)}
                </Text>
                <Tag color="red">ลดราคา</Tag>
              </>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="สถานะ">
          <Tag 
            color={
              course.status === 'PUBLISHED' ? 'green' : 
              course.status === 'DRAFT' ? 'orange' : 'red'
            }
          >
            {course.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' :
             course.status === 'DRAFT' ? 'แบบร่าง' : course.status}
          </Tag>
        </Descriptions.Item>

        {course.chapters && course.chapters.length > 0 && (
          <Descriptions.Item label="จำนวนบทเรียน" span={2}>
            <Space>
              <FileTextOutlined style={{ color: "#52c41a" }} />
              <Text>{course.chapters.length} บท</Text>
            </Space>
          </Descriptions.Item>
        )}

        {course.isFree && (
          <Descriptions.Item label="ประเภท" span={2}>
            <Tag color="green" icon={<PlayCircleOutlined />}>
              คอร์สฟรี
            </Tag>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Chapter List */}
      {course.chapters && course.chapters.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            <FileTextOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            รายการบทเรียน
          </Title>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {course.chapters.map((chapter, index) => (
                <Card 
                  key={chapter.id} 
                  size="small" 
                  style={{ 
                    backgroundColor: "#fafafa",
                    border: "1px solid #f0f0f0"
                  }}
                >
                  <Space align="start" style={{ width: '100%' }}>
                    <Text 
                      strong 
                      style={{ 
                        minWidth: "30px",
                        color: "#1890ff",
                        fontSize: "14px"
                      }}
                    >
                      {chapter.order || index + 1}.
                    </Text>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: "14px" }}>
                        {chapter.title}
                      </Text>
                      {chapter.description && (
                        <div style={{ marginTop: "4px" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {chapter.description}
                          </Text>
                        </div>
                      )}
                      {chapter.contents && chapter.contents.length > 0 && (
                        <div style={{ marginTop: "6px" }}>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            เนื้อหา: {chapter.contents.length} รายการ
                          </Text>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>
        </div>
      )}
    </Card>
  );
}