"use client";
import { useState } from 'react';
import {
  Button,
  Card,
  Typography,
  Space,
  message,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";

// Components
import PostTable from "@/components/admin/posts/PostTable";
import PostModal from "@/components/admin/posts/PostModal";
import DeleteModal from "@/components/admin/posts/DeleteModal";
import PostFilters from "@/components/admin/posts/PostFilters";

// Hooks
import { usePosts } from "@/hooks/usePosts";

const { Title, Text } = Typography;

export default function PostsPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for posts data
  const {
    posts,
    postTypes,
    authors,
    loading,
    postTypesLoading,
    authorsLoading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    savePost,
    deletePost,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
  } = usePosts();

  // Create or update post
  const handleSubmitPost = async (postData) => {
    try {
      const success = await savePost(postData, editing);
      if (success) {
        setModalOpen(false);
        setEditing(null);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setPostToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!postToDelete?.id) {
      message.error("ไม่พบ ID ของโพสต์");
      return;
    }

    setDeleting(true);

    try {
      const success = await deletePost(postToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setPostToDelete(null);
      }
    } catch (error) {
      console.error("Delete post error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
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

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>กำลังโหลด...</div>
      </div>
    );
  }

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
            <FileTextOutlined style={{ marginRight: "8px" }} />
            จัดการโพสต์
          </Title>
          <Text type="secondary">จัดการบทความและเนื้อหาต่างๆ</Text>
        </Space>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มโพสต์ใหม่
          </Button>
        </div>

        <PostFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          postTypes={postTypes}
        />
      </Card>

      <Card>
        <PostTable
          posts={posts}
          loading={loading}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      </Card>

      {/* Create/Edit Modal */}
      <PostModal
        open={modalOpen}
        editing={editing}
        postTypes={postTypes}
        onCancel={closeModal}
        onSubmit={handleSubmitPost}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        post={postToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
