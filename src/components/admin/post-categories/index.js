"use client";
import { useState } from "react";
import { Button, Card, Typography, Space } from "antd";
import { TagOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import PostCategoryFilters from "./PostCategoryFilters";
import PostCategoryTable from "./PostCategoryTable";
import PostCategoryModal from "./PostCategoryModal";
import DeleteModal from "./DeleteModal";

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
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for post categories data
  const {
    postCategories,
    setPostCategories,
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

  // Create or update post category with optimistic updates
  const handleSubmitCategory = async (categoryData) => {
    setSubmitting(true);
    try {
      if (editing) {
        // Optimistic update for edit
        const originalCategory = editing;
        const updatedCategory = { ...originalCategory, ...categoryData, updatedAt: new Date().toISOString() };
        
        // Update UI immediately
        setPostCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editing.id ? updatedCategory : cat
          )
        );

        try {
          const res = await fetch(`/api/admin/post-types/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          });

          const data = await res.json();

          if (data.success) {
            message.success("แก้ไขหมวดหมู่โพสต์สำเร็จ");
            setModalOpen(false);
            setEditing(null);
          } else {
            // Rollback on error
            setPostCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === editing.id ? originalCategory : cat
              )
            );
            message.error(data.error || "แก้ไขหมวดหมู่โพสต์ไม่สำเร็จ");
          }
        } catch (error) {
          // Rollback on error
          setPostCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === editing.id ? originalCategory : cat
            )
          );
          message.error("เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่โพสต์");
        }
      } else {
        // Optimistic update for create
        const tempId = Date.now().toString();
        const newCategory = {
          id: tempId,
          ...categoryData,
          postCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isOptimistic: true
        };
        
        // Add to UI immediately
        setPostCategories(prevCategories => [newCategory, ...prevCategories]);

        try {
          const res = await fetch("/api/admin/post-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          });

          const data = await res.json();

          if (data.success) {
            // Replace optimistic item with real data
            setPostCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === tempId ? { ...data.data, _isOptimistic: false } : cat
              )
            );
            message.success("สร้างหมวดหมู่โพสต์สำเร็จ");
            setModalOpen(false);
            setEditing(null);
          } else {
            // Remove optimistic item on error
            setPostCategories(prevCategories => 
              prevCategories.filter(cat => cat.id !== tempId)
            );
            message.error(data.error || "สร้างหมวดหมู่โพสต์ไม่สำเร็จ");
          }
        } catch (error) {
          // Remove optimistic item on error
          setPostCategories(prevCategories => 
            prevCategories.filter(cat => cat.id !== tempId)
          );
          message.error("เกิดข้อผิดพลาดในการสร้างหมวดหมู่โพสต์");
        }
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      message.error("เกิดข้อผิดพลาดไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete with optimistic updates
  const handleDelete = (record) => {
    setCategoryToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete with optimistic updates
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      message.error("ไม่พบ ID ของหมวดหมู่โพสต์");
      return;
    }

    setDeleting(true);

    // Optimistic update - remove immediately
    setPostCategories(prevCategories => 
      prevCategories.filter(cat => cat.id !== categoryToDelete.id)
    );

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
      } else {
        // Rollback on error
        setPostCategories(prevCategories => [...prevCategories, categoryToDelete]);
        message.error(data.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่โพสต์");
      }
    } catch (error) {
      console.error("Delete post category error:", error);
      // Rollback on error
      setPostCategories(prevCategories => [...prevCategories, categoryToDelete]);
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
            loading={submitting}
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
          deletingId={deleting ? categoryToDelete?.id : null}
        />
      </Card>

      {/* Create/Edit Modal */}
      <PostCategoryModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitCategory}
        loading={submitting}
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