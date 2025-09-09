"use client";
import { Modal, Button, Typography, Space } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function DeleteModal({
  open,
  ebook,
  loading,
  onConfirm,
  onCancel,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>ยืนยันการลบ eBook</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          ยกเลิก
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
        >
          ลบ eBook
        </Button>,
      ]}
      width={500}
    >
      {ebook && (
        <div>
          <p>คุณแน่ใจหรือไม่ที่จะลบ eBook นี้?</p>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              marginTop: "12px",
            }}
          >
            <Text strong>ชื่อหนังสือ: </Text>
            <Text>{ebook.title}</Text>
            <br />
            <Text strong>ผู้เขียน: </Text>
            <Text>{ebook.author}</Text>
            <br />
            <Text strong>ราคา: </Text>
            <Text>
              {ebook.discountPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>
                    {formatPrice(ebook.price)}
                  </span>
                  {' '}
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {formatPrice(ebook.discountPrice)}
                  </span>
                </>
              ) : (
                formatPrice(ebook.price)
              )}
            </Text>
            {ebook.isbn && (
              <>
                <br />
                <Text strong>ISBN: </Text>
                <Text>{ebook.isbn}</Text>
              </>
            )}
          </div>
          <p style={{ color: "#ff4d4f", marginTop: "12px", marginBottom: 0 }}>
            <ExclamationCircleOutlined /> การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>
        </div>
      )}
    </Modal>
  );
}