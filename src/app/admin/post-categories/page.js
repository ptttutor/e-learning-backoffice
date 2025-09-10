"use client";
import { useState } from "react";
import { Button, Card, Typography, Space } from "antd";
import { TagOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import PostCategoryFilters from "@/components/admin/post-categories/PostCategoryFilters";
import PostCategoryTable from "@/components/admin/post-categories/PostCategoryTable";
import PostCategoryModal from "@/components/admin/post-categories/PostCategoryModal";
import DeleteModal from "@/components/admin/post-categories/DeleteModal";

// Hooks
import { usePostCategories } from "@/hooks/usePostCategories";
import { useMessage } from "@/hooks/useAntdApp";

const { Title, Text } = Typography;

export default function PostCategoriesPage() {
  const message = useMessage();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for post categories data
  const {
    postCategories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchPostCategories,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  } = usePostCategories();

  // Create or update post category
  const handleSubmitCategory = async (categoryData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/post-types/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
      } else {
        res = await fetch("/api/admin/post-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(editing ? "แก้ไขหมวดหมู่โพสต์สำเร็จ" : "สร้างหมวดหมู่โพสต์สำเร็จ");
        setModalOpen(false);
        setEditing(null);
        fetchPostCategories();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setCategoryToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      message.error("ไม่พบ ID ของหมวดหมู่โพสต์");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/post-types/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบหมวดหมู่โพสต์สำเร็จ");
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        await fetchPostCategories();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่โพสต์");
      }
    } catch (error) {
      console.error("Delete post category error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
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
          <Title level={2} style={{ margin: 0 }}>
            <TagOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่โพสต์
          </Title>
          <Text type="secondary">สร้างและจัดการหมวดหมู่สำหรับโพสต์</Text>
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
          >
            สร้างหมวดหมู่ใหม่
          </Button>
        </div>

        <PostCategoryFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          totalCount={pagination.totalCount}
          currentCount={postCategories.length}
        />
      </Card>

      <Card>
        <PostCategoryTable
          postCategories={postCategories}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <PostCategoryModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        postCategory={categoryToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
