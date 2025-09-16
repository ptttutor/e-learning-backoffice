"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Space,
  Modal,
  Form,
  Card,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMessage } from "@/hooks/useAntdApp";

// Components
import CategoriesTable from "./CategoriesTable";
import CategoryModal from "./CategoryModal";
import DeleteModal from "./DeleteModal";

const { Title, Text } = Typography;

export default function CategoriesManagement() {
  const message = useMessage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setLoading(false);
  }, [message]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper functions for optimistic updates
  const updateCategoryInList = (categoryId, updatedData) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, ...updatedData }
          : category
      )
    );
  };

  const addCategoryToList = (newCategory) => {
    setCategories(prevCategories => [newCategory, ...prevCategories]);
  };

  const removeCategoryFromList = (categoryId) => {
    setCategories(prevCategories => 
      prevCategories.filter(category => category.id !== categoryId)
    );
  };

  // Create or update category
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(
          editing ? "แก้ไขหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        
        // Optimistic update without full page refresh
        if (editing) {
          // Update existing category in the list
          updateCategoryInList(editing.id, data.data);
        } else {
          // Add new category to the list
          addCategoryToList(data.data);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
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

  // Delete category
  const handleDelete = (id, name) => {
    const category = categories.find(cat => cat.id === id);
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      message.error("ไม่พบ ID ของหมวดหมู่");
      return;
    }

    setDeleting(categoryToDelete.id);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("ลบหมวดหมู่สำเร็จ");
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        
        // Optimistic update - remove from list without full refresh
        removeCategoryFromList(categoryToDelete.id);
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      // On error, refresh the data to ensure consistency
      fetchCategories();
    } finally {
      setDeleting(null);
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
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
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
          <Title level={2} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: "8px" }} />
            จัดการหมวดหมู่
          </Title>
          <Text type="secondary">จัดการหมวดหมู่สินค้าและเนื้อหา</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
            size="middle"
            disabled={submitting || deleting}
          >
            สร้างหมวดหมู่ใหม่
          </Button>
        </div>

        <CategoriesTable
          categories={categories}
          loading={loading}
          submitting={submitting}
          deleting={deleting}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      </Card>

      <CategoryModal
        open={modalOpen}
        editing={editing}
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