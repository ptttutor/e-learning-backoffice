import { Card, Space, Typography, Image, Avatar, Divider, Tag, Descriptions } from "antd";
import { BookOutlined, ReadOutlined, DollarOutlined, UserOutlined, TagOutlined, ClockCircleOutlined, FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function ProductInfoCard({ selectedOrder, formatPrice }) {
  // ดึงชื่อสินค้าจาก items array
  const productTitle = selectedOrder.items && selectedOrder.items.length > 0 
    ? selectedOrder.items[0].title 
    : selectedOrder.ebook?.title || selectedOrder.course?.title || "ไม่ระบุชื่อสินค้า";
  
  return (
    <Card
      title={
        <Space>
          {selectedOrder.orderType === "EBOOK" ? (
            <ReadOutlined style={{ color: "#1890ff" }} />
          ) : (
            <BookOutlined style={{ color: "#1890ff" }} />
          )}
          <Text strong>ข้อมูลสินค้า: {productTitle}</Text>
        </Space>
      }
      style={{ marginBottom: "20px" }}
      size="small"
    >
      <Space align="start" size={20}>
        {(selectedOrder.ebook?.coverImageUrl || selectedOrder.course?.coverImageUrl) ? (
          <Image
            src={selectedOrder.ebook?.coverImageUrl || selectedOrder.course?.coverImageUrl}
            alt={selectedOrder.ebook?.title || selectedOrder.course?.title}
            width={120}
            height={120}
            style={{
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          />
        ) : (
          <Avatar
            icon={
              selectedOrder.orderType === "EBOOK" ? (
                <ReadOutlined />
              ) : (
                <BookOutlined />
              )
            }
            size={120}
            style={{ backgroundColor: "#1890ff" }}
          />
        )}
        <div style={{ flex: 1 }}>
          <Title
            level={4}
            style={{ margin: "0 0 12px 0", color: "#262626" }}
          >
            {productTitle}
          </Title>
          
          {/* Basic Description for both Course and Ebook */}
          {(selectedOrder.course?.description || selectedOrder.ebook?.description) && (
            <Paragraph 
              ellipsis={{ rows: 2, expandable: true, symbol: 'เพิ่มเติม' }}
              style={{ marginBottom: "16px", color: "#666" }}
            >
              {selectedOrder.course?.description || selectedOrder.ebook?.description}
            </Paragraph>
          )}

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {/* Basic Info */}
            <Space size={16} wrap>
              <Space size={4}>
                <TagOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary">
                  ประเภท: {selectedOrder.orderType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
                </Text>
              </Space>
              
              {selectedOrder.ebook?.author && (
                <Space size={4}>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <Text type="secondary">ผู้แต่ง: {selectedOrder.ebook.author}</Text>
                </Space>
              )}

              {selectedOrder.course?.instructor && (
                <Space size={4}>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <Text type="secondary">อาจารย์: {selectedOrder.course.instructor.name}</Text>
                </Space>
              )}
            </Space>

            {/* Ebook Specific Details (only show for ebooks since courses have separate card) */}
            {selectedOrder.ebook && (
              <Space size={16} wrap>
                {selectedOrder.ebook.pageCount && (
                  <Space size={4}>
                    <FileTextOutlined style={{ color: "#52c41a" }} />
                    <Text type="secondary">จำนวนหน้า: {selectedOrder.ebook.pageCount} หน้า</Text>
                  </Space>
                )}
                
                {selectedOrder.ebook.language && (
                  <Tag color="cyan">
                    {selectedOrder.ebook.language}
                  </Tag>
                )}

                {selectedOrder.ebook.format && (
                  <Tag color="purple">
                    {selectedOrder.ebook.format}
                  </Tag>
                )}

                {selectedOrder.ebook.category && (
                  <Tag color="blue" icon={<TagOutlined />}>
                    {selectedOrder.ebook.category.name}
                  </Tag>
                )}
              </Space>
            )}

            {/* Course Basic Info (only basic info since detailed info will be in CourseInfoCard) */}
            {selectedOrder.course && (
              <Space size={16} wrap>
                {selectedOrder.course.category && (
                  <Tag color="blue" icon={<TagOutlined />}>
                    {selectedOrder.course.category.name}
                  </Tag>
                )}

                {selectedOrder.course.isFree && (
                  <Tag color="green" icon={<PlayCircleOutlined />}>
                    คอร์สฟรี
                  </Tag>
                )}
                
                <Tag color="processing">
                  รายละเอียดเพิ่มเติมด้านล่าง
                </Tag>
              </Space>
            )}

            <Divider style={{ margin: "12px 0" }} />
            
            {/* Price */}
            <Space size={8}>
              <DollarOutlined
                style={{ color: "#52c41a", fontSize: "18px" }}
              />
              <Text
                strong
                style={{ fontSize: "20px", color: "#52c41a" }}
              >
                {formatPrice(selectedOrder.total)}
              </Text>
              {(selectedOrder.course?.discountPrice || selectedOrder.ebook?.discountPrice) && (
                <>
                  <Text delete type="secondary" style={{ fontSize: "16px", marginLeft: "8px" }}>
                    {formatPrice(selectedOrder.course?.price || selectedOrder.ebook?.price)}
                  </Text>
                  <Tag color="red">ลดราคา</Tag>
                </>
              )}
            </Space>
          </Space>
        </div>
      </Space>
    </Card>
  );
}