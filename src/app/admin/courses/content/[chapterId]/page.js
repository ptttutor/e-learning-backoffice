"use client";
import React, { useState } from "react";
import {
  Button,
  Space,
  Form,
  message,
  Card,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

// Components
import ContentTable from "@/components/admin/contents/ContentTable";
import ContentModal from "@/components/admin/contents/ContentModal";
import DeleteModal from "@/components/admin/contents/DeleteModal";
import OrderActions from "@/components/admin/contents/OrderActions";

// Hooks
import { useContents } from "@/hooks/useContents";

const { Title, Text } = Typography;

export default function AdminContentPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form] = Form.useForm();

  // Use custom hook for contents data
  const {
    contents,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    initialOrder,
    fetchContents,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useContents(chapterId);

  // Create or update content
  const handleSubmitContent = async (contentData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/contents/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentData),
        });
      } else {
        res = await fetch(`/api/admin/contents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contentData, chapterId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(editing ? "แก้ไขเนื้อหาสำเร็จ" : "สร้างเนื้อหาสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchContents();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setContentToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!contentToDelete?.id) {
      message.error("ไม่พบ ID ของเนื้อหา");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/contents/${contentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบเนื้อหาสำเร็จ");
        setDeleteModalOpen(false);
        setContentToDelete(null);
        await fetchContents();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบเนื้อหา");
      }
    } catch (error) {
      console.error("Delete content error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setContentToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      // ตั้งค่า order เป็นลำดับถัดไป
      const nextOrder =
        contents.length > 0 ? Math.max(...contents.map((c) => c.order)) + 1 : 1;
      form.setFieldsValue({ order: nextOrder });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{ borderRadius: "6px" }}
            >
              กลับ
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              จัดการเนื้อหา
            </Title>
          </Space>
          <Text type="secondary">สร้างและจัดการเนื้อหาใน Chapter</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal(null)}
              style={{ borderRadius: "6px" }}
            >
              สร้างเนื้อหาใหม่
            </Button>

            <OrderActions
              hasUnsavedChanges={hasUnsavedChanges}
              savingOrder={savingOrder}
              initialOrderLength={initialOrder.length}
              onSaveOrder={saveOrderChanges}
              onCancelOrder={cancelOrderChanges}
              onResetOrder={resetOrder}
            />
          </Space>
        </div>

        <ContentTable
          contents={contents}
          loading={loading}
          activeId={activeId}
          sensors={sensors}
          onEdit={openModal}
          onDelete={handleDelete}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ContentModal
        open={modalOpen}
        editing={editing}
        form={form}
        onCancel={closeModal}
        onSubmit={handleSubmitContent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        content={contentToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
