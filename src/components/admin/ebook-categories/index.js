"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Space,
  Modal,
  Form,
  Card,
  Typography,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMessage } from "@/hooks/useAntdApp";

// Components
import EbookCategoriesTable from "./EbookCategoriesTable";
import EbookCategoryModal from "./EbookCategoryModal";
import DeleteModal from "./DeleteModal";

const { Title, Text } = Typography;

export default function EbookCategoriesManagement() {
  const message = useMessage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ebook-categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Optimistic update functions
  const updateCategoryInList = (categoryId, updatedData) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId ? { ...category, ...updatedData } : category
    ));
  };

  const addCategoryToList = (newCategory) => {
    setCategories(prev => [newCategory, ...prev]);
  };

  const removeCategoryFromList = (categoryId) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
  };

  // Handle submit with optimistic updates
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const url = editingCategory
        ? `/api/admin/ebook-categories/${editingCategory.id}`
        : "/api/admin/ebook-categories";
      const method = editingCategory ? "PUT" : "POST";

      // For edit operations, optimistically update the UI first
      if (editingCategory) {
        updateCategoryInList(editingCategory.id, values);
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(
          editingCategory ? "อัพเดทหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ"
        );
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
        
        // For create operations, add to list
        if (!editingCategory && data) {
          addCategoryToList(data);
        } else if (editingCategory && data) {
          // Update with server response data
          updateCategoryInList(editingCategory.id, data);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        // Revert optimistic update on error
        if (editingCategory) {
          // Refresh to get current state
          fetchCategories();
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      // On error, refresh the data to ensure consistency
      fetchCategories();
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal for create/edit
  const openModal = (category = null) => {
    setEditingCategory(category);
    setModalVisible(true);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id, name) => {
    const category = categories.find(cat => cat.id === id);
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Confirm delete with optimistic updates
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      message.error("ไม่พบ ID ของหมวดหมู่");
      return;
    }

    setDeleting(categoryToDelete.id);
    
    // Optimistically remove from list
    removeCategoryFromList(categoryToDelete.id);
    
    try {
      const response = await fetch(`/api/admin/ebook-categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        message.success("ลบหมวดหมู่สำเร็จ");
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        message.error("เกิดข้อผิดพลาดในการลบ");
        // Revert optimistic update by re-adding the item
        addCategoryToList(categoryToDelete);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      // Revert optimistic update by re-adding the item
      addCategoryToList(categoryToDelete);
    } finally {
      setDeleting(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
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
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่ eBook
          </Title>
          <Text type="secondary">
            จัดการหมวดหมู่สำหรับหนังสืออิเล็กทรอนิกส์
          </Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ borderRadius: "6px" }}
            size="middle"
            disabled={submitting || deleting}
          >
            เพิ่มหมวดหมู่ใหม่
          </Button>
        </div>

        <EbookCategoriesTable
          categories={categories}
          loading={loading}
          submitting={submitting}
          deleting={deleting}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      </Card>

      <EbookCategoryModal
        open={modalVisible}
        editing={editingCategory}
        form={form}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />

      <DeleteModal
        open={deleteModalOpen}
        category={categoryToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}