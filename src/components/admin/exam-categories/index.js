"use client";
import { useState } from "react";
import { Button, Card, Typography } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import ExamCategoryFilters from "./ExamCategoryFilters";
import ExamCategoryTable from "./ExamCategoryTable";
import ExamCategoryModal from "./ExamCategoryModal";

// Hooks
import { useExamCategories } from "@/hooks/useExamCategories";
import { useMessage } from "@/hooks/useAntdApp";

const { Title, Text } = Typography;

export default function ExamCategoriesPage() {
  const message = useMessage();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toggling, setToggling] = useState(null);

  // Use custom hook for exam categories data
  const {
    examCategories,
    setExamCategories,
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

  // Handle create or update with optimistic updates
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        // Optimistic update for edit
        const originalCategory = editingData;
        const updatedCategory = { ...originalCategory, ...formData, updatedAt: new Date().toISOString() };
        
        // Update UI immediately
        setExamCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingData.id ? updatedCategory : cat
          )
        );
        
        try {
          const result = await updateExamCategory(editingData.id, formData);
          
          if (result.success) {
            message.success("แก้ไขหมวดหมู่สำเร็จ");
            setModalOpen(false);
            setEditing(null);
            setEditingData(null);
          } else {
            // Rollback on error
            setExamCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === editingData.id ? originalCategory : cat
              )
            );
            message.error(result.error || "แก้ไขหมวดหมู่ไม่สำเร็จ");
          }
        } catch (error) {
          // Rollback on error
          setExamCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === editingData.id ? originalCategory : cat
            )
          );
          message.error("เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่");
        }
      } else {
        // Optimistic update for create
        const tempId = Date.now().toString();
        const newCategory = {
          id: tempId,
          ...formData,
          isActive: true,
          examCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isOptimistic: true
        };
        
        // Add to UI immediately
        setExamCategories(prevCategories => [newCategory, ...prevCategories]);
        
        try {
          const result = await createExamCategory(formData);
          
          if (result.success) {
            // Replace optimistic item with real data
            setExamCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === tempId ? { ...result.data, _isOptimistic: false } : cat
              )
            );
            message.success("เพิ่มหมวดหมู่สำเร็จ");
            setModalOpen(false);
            setEditing(null);
            setEditingData(null);
          } else {
            // Remove optimistic item on error
            setExamCategories(prevCategories => 
              prevCategories.filter(cat => cat.id !== tempId)
            );
            message.error(result.error || "เพิ่มหมวดหมู่ไม่สำเร็จ");
          }
        } catch (error) {
          // Remove optimistic item on error
          setExamCategories(prevCategories => 
            prevCategories.filter(cat => cat.id !== tempId)
          );
          message.error("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("เกิดข้อผิดพลาดไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditing(null);
    setEditingData(null);
  };

  // Handle delete with optimistic updates
  const handleDelete = async (id) => {
    const categoryToDelete = examCategories.find(cat => cat.id === id);
    if (!categoryToDelete) return;

    setDeletingId(id);

    // Optimistic update - remove immediately
    setExamCategories(prevCategories => 
      prevCategories.filter(cat => cat.id !== id)
    );

    try {
      const result = await deleteExamCategory(id);
      
      if (result.success) {
        message.success("ลบหมวดหมู่สำเร็จ");
      } else {
        // Rollback on error
        setExamCategories(prevCategories => [...prevCategories, categoryToDelete]);
        message.error(result.error || "ลบหมวดหมู่ไม่สำเร็จ");
      }
    } catch (error) {
      // Rollback on error
      setExamCategories(prevCategories => [...prevCategories, categoryToDelete]);
      message.error("เกิดข้อผิดพลาดในการลบหมวดหมู่");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle toggle status with optimistic updates
  const handleToggleStatus = async (id, isActive) => {
    const originalCategory = examCategories.find(cat => cat.id === id);
    if (!originalCategory) return;

    setToggling(id);

    // Optimistic update - toggle status immediately
    setExamCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.id === id ? { ...cat, isActive } : cat
      )
    );

    try {
      const result = await toggleExamCategoryStatus(id, isActive);
      
      if (result.success) {
        message.success(`${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}หมวดหมู่สำเร็จ`);
      } else {
        // Rollback on error
        setExamCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === id ? originalCategory : cat
          )
        );
        message.error(result.error || "เปลี่ยนสถานะไม่สำเร็จ");
      }
    } catch (error) {
      // Rollback on error
      setExamCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === id ? originalCategory : cat
        )
      );
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    } finally {
      setToggling(null);
    }
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
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
            loading={submitting}
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
          deletingId={deletingId}
          toggling={toggling}
        />
      </Card>

      {/* Modal */}
      <ExamCategoryModal
        open={modalOpen}
        editing={editing}
        initialData={editingData}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}