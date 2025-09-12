"use client";
import { useState } from "react";
import { Button, Card, Typography } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import ExamCategoryFilters from "@/components/admin/exam-categories/ExamCategoryFilters";
import ExamCategoryTable from "@/components/admin/exam-categories/ExamCategoryTable";
import ExamCategoryModal from "@/components/admin/exam-categories/ExamCategoryModal";

// Hooks
import { useExamCategories } from "@/hooks/useExamCategories";

const { Title, Text } = Typography;

export default function ExamCategoriesPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Use custom hook for exam categories data
  const {
    examCategories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    createExamCategory,
    updateExamCategory,
    deleteExamCategory,
    toggleExamCategoryStatus,
    updateFilters,
    handleSearch,
    handleClearSearch,
    handlePageChange,
    handleSortChange,
  } = useExamCategories();

  // Handle opening modal for create
  const handleCreate = () => {
    setEditing(false);
    setEditingData(null);
    setModalOpen(true);
  };

  // Handle opening modal for edit
  const handleEdit = (record) => {
    setEditing(true);
    setEditingData(record);
    setModalOpen(true);
  };

  // Handle create or update
  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      let result;
      if (editing) {
        result = await updateExamCategory(editingData.id, formData);
      } else {
        result = await createExamCategory(formData);
      }

      if (result.success) {
        setModalOpen(false);
        setEditing(null);
        setEditingData(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditing(null);
    setEditingData(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    await deleteExamCategory(id);
  };

  // Handle toggle status
  const handleToggleStatus = async (id, isActive) => {
    await toggleExamCategoryStatus(id, isActive);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
    handleSearch();
  };

  // Handle table changes (pagination, sorting)
  const handleTableChange = (page, pageSize, sortBy, sortOrder) => {
    if (sortBy && sortOrder) {
      handleSortChange(sortBy, sortOrder);
    } else {
      handlePageChange(page, pageSize);
    }
  };

  // Handle reset filters
  const handleReset = () => {
    updateFilters({
      search: "",
      isActive: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    handleClearSearch();
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOutlined />
              จัดการหมวดหมู่ข้อสอบ
            </Title>
            <Text type="secondary">
              สร้าง แก้ไข และจัดการหมวดหมู่ข้อสอบในระบบ
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
          >
            เพิ่มหมวดหมู่ใหม่
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <ExamCategoryFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          totalCount={pagination.totalCount}
          currentCount={examCategories.length}
        />
      </Card>

      {/* Table */}
      <Card>
        <ExamCategoryTable
          examCategories={examCategories}
          loading={loading}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Modal */}
      <ExamCategoryModal
        open={modalOpen}
        editing={editing}
        initialData={editingData}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        loading={modalLoading}
      />
    </div>
  );
}