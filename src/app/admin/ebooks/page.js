"use client";
import { useState } from 'react';
import { Button, Card, Typography, Space, Spin } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import EbookFilters from "@/components/admin/ebooks/EbookFilters";
import EbookTable from "@/components/admin/ebooks/EbookTable";
import EbookModal from "@/components/admin/ebooks/EbookModal";
import DeleteModal from "@/components/admin/ebooks/DeleteModal";

// Hooks
import { useEbooks } from "@/hooks/useEbooks";

const { Title, Text } = Typography;

export default function EbooksPage() {
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for ebooks data
  const {
    ebooks,
    categories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    submitEbook,
    deleteEbook,
  } = useEbooks();

  // Handle submit ebook
  const handleSubmit = async (values) => {
    const success = await submitEbook(values, editingEbook);
    if (success) {
      setModalVisible(false);
      setEditingEbook(null);
    }
  };

  // Open modal for create/edit
  const openModal = (ebook = null) => {
    setEditingEbook(ebook);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingEbook(null);
  };

  // Handle delete
  const handleDelete = (ebook) => {
    setEbookToDelete(ebook);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!ebookToDelete?.id) {
      return;
    }

    setDeleting(true);
    const success = await deleteEbook(ebookToDelete.id);
    
    if (success) {
      setDeleteModalOpen(false);
      setEbookToDelete(null);
    }
    setDeleting(false);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEbookToDelete(null);
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
        <Spin size="large" />
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
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการ eBooks
          </Title>
          <Text type="secondary">จัดการหนังสืออิเล็กทรอนิกส์และเนื้อหา</Text>
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
            เพิ่ม eBook ใหม่
          </Button>
        </div>

        <EbookFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
          totalCount={pagination.totalCount}
          currentCount={ebooks.length}
        />
      </Card>

      <Card>
        <EbookTable
          ebooks={ebooks}
          categories={categories}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <EbookModal
        open={modalVisible}
        editing={editingEbook}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        ebook={ebookToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}