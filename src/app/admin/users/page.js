"use client";
import { useState } from "react";
import { Button, Card, Typography, Space } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { useMessage } from "@/hooks/useAntdApp";

// Components
import UserFilters from "@/components/admin/users/UserFilters";
import UserTable from "@/components/admin/users/UserTable";
import UserModal from "@/components/admin/users/UserModal";
import DeleteModal from "@/components/admin/users/DeleteModal";
import UserStatsCards from "@/components/admin/users/UserStatsCards";

// Hooks
import { useUsers } from "@/hooks/useUsers";

const { Title, Text } = Typography;

export default function UsersPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const message = useMessage();

  // Use custom hook for users data
  const {
    users,
    loading,
    stats,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchUsers,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  } = useUsers();

  // Create or update user
  const handleSubmitUser = async (userData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      } else {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(editing ? "แก้ไขผู้ใช้สำเร็จ" : "สร้างผู้ใช้สำเร็จ");
        setModalOpen(false);
        setEditing(null);
        fetchUsers();
      } else {
        message.error(`${data.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (error) {
      console.error("Submit user error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกผู้ใช้");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setUserToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete?.id) {
      message.error("ไม่พบ ID ของผู้ใช้");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        message.success("ลบผู้ใช้สำเร็จ");
        setDeleteModalOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      } else {
        message.error(`${data.error || "เกิดข้อผิดพลาดในการลบผู้ใช้"}`);
      }
    } catch (error) {
      console.error("Delete user error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
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

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const newRole = user.role === 'STUDENT' ? 'INSTRUCTOR' : 'STUDENT';
      
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        message.success(`เปลี่ยนสถานะเป็น ${newRole === 'INSTRUCTOR' ? 'ผู้สอน' : 'นักเรียน'} สำเร็จ`);
        fetchUsers();
      } else {
        message.error(`${data.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (error) {
      console.error("Toggle user status error:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                จัดการผู้ใช้งาน
              </Title>
              <Text type="secondary">
                จัดการข้อมูลผู้ใช้งาน สิทธิ์การเข้าถึง และสถานะการเรียน
              </Text>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal(null)}
              size="large"
            >
              เพิ่มผู้ใช้ใหม่
            </Button>
          </div>
        </Space>
      </Card>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <UserFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={users.length}
        loading={loading}
      />

      {/* Table */}
      <UserTable
        users={users}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onTableChange={handleTableChange}
      />

      {/* Create/Edit Modal */}
      <UserModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        user={userToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
