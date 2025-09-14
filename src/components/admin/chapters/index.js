"use client";
import React, { useState } from "react";
import {
  Button,
  Space,
  Form,
  Card,
  Typography,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

// Components
import ChapterTable from "./ChapterTable";
import ChapterModal from "./ChapterModal";
import DeleteModal from "./DeleteModal";
import OrderActions from "./OrderActions";
import ChapterFilters from "./ChapterFilters";

// Hooks
import { useChapters } from "@/hooks/useChapters";
import { useMessage } from "@/hooks/useAntdApp";

const { Title, Text } = Typography;

export default function ChaptersManagement() {
  const { courseId } = useParams();
  const router = useRouter();
  const message = useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Use custom hook for chapters data
  const {
    chapters,
    allChapters,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    initialOrder,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchChapters,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
    updateChapterInList,
    addChapterToList,
    removeChapterFromList,
  } = useChapters(courseId);

  // Create or update chapter
  const handleSubmitChapter = async (chapterData) => {
    setSubmitting(true);
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/chapters/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chapterData),
        });
      } else {
        res = await fetch(`/api/admin/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...chapterData, courseId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(
          editing ? "แก้ไข chapter สำเร็จ" : "สร้าง chapter สำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        
        // Optimistic update without full page refresh
        if (editing) {
          // Update existing chapter in the list
          updateChapterInList(editing.id, data.data);
        } else {
          // Add new chapter to the list
          addChapterToList(data.data);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
      // On error, refresh the data to ensure consistency
      fetchChapters();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setChapterToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!chapterToDelete?.id) {
      message.error("ไม่พบ ID ของ chapter");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/chapters/${chapterToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบ chapter สำเร็จ");
        setDeleteModalOpen(false);
        setChapterToDelete(null);
        
        // Optimistic update - remove from list without full refresh
        removeChapterFromList(chapterToDelete.id);
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบ chapter");
      }
    } catch (error) {
      console.error("Delete chapter error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
      // On error, refresh the data to ensure consistency
      fetchChapters();
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setChapterToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      // ตั้งค่า order เป็นลำดับถัดไป (ใช้ allChapters)
      const nextOrder =
        allChapters.length > 0 ? Math.max(...allChapters.map((c) => c.order)) + 1 : 1;
      form.setFieldsValue({ order: nextOrder });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  // Handle manage content
  const handleManageContent = (record) => {
    router.push(`/admin/courses/content/${record.id}`);
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
              <BookOutlined style={{ marginRight: "8px" }} />
              จัดการ Chapter
            </Title>
          </Space>
          <Text type="secondary">สร้างและจัดการ Chapter ของคอร์สเรียน</Text>
        </Space>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
            disabled={submitting || deleting || savingOrder}
          >
            สร้าง Chapter ใหม่
          </Button>
        </div>

        <ChapterFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <OrderActions
            hasUnsavedChanges={hasUnsavedChanges}
            savingOrder={savingOrder}
            initialOrderLength={initialOrder.length}
            onSaveOrder={saveOrderChanges}
            onCancelOrder={cancelOrderChanges}
            onResetOrder={resetOrder}
          />
        </div>

        <ChapterTable
          chapters={chapters}
          allChapters={allChapters}
          loading={loading}
          activeId={activeId}
          sensors={sensors}
          onEdit={openModal}
          onDelete={handleDelete}
          onManageContent={handleManageContent}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          disabled={submitting || deleting || savingOrder}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ChapterModal
        open={modalOpen}
        editing={editing}
        form={form}
        onCancel={closeModal}
        onSubmit={handleSubmitChapter}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        chapter={chapterToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}