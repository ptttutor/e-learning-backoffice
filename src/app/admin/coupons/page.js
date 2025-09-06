"use client";
import { useState } from "react";
import { Button, Card, Typography, Space, message } from "antd";
import { TagsOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import CouponFilters from "@/components/admin/coupons/CouponFilters";
import CouponTable from "@/components/admin/coupons/CouponTable";
import CouponModal from "@/components/admin/coupons/CouponModal";
import DeleteModal from "@/components/admin/coupons/DeleteModal";

// Hooks
import { useCoupons } from "@/hooks/useCoupons";

const { Title, Text } = Typography;

export default function CouponsPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for coupons data
  const {
    coupons,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCoupons,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  } = useCoupons();

  // Create or update coupon
  const handleSubmitCoupon = async (couponData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/coupons/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      message.success(editing ? "แก้ไขคูปองสำเร็จ" : "สร้างคูปองสำเร็จ");
      setModalOpen(false);
      setEditing(null);
      fetchCoupons();
    } catch (error) {
      console.error("Submit error:", error);
      message.error(error.message || "เกิดข้อผิดพลาดในการบันทึกคูปอง");
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      message.success("ลบคูปองสำเร็จ");
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(error.message || "เกิดข้อผิดพลาดในการลบคูปอง");
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const handleEdit = (coupon) => {
    setEditing(coupon);
    setModalOpen(true);
  };

  // Open delete modal
  const handleDelete = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  // Toggle coupon status
  const handleToggleStatus = async (coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coupon,
          isActive: !coupon.isActive,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      message.success(
        coupon.isActive ? "ปิดใช้งานคูปองสำเร็จ" : "เปิดใช้งานคูปองสำเร็จ"
      );
      fetchCoupons();
    } catch (error) {
      console.error("Toggle error:", error);
      message.error(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card 
        style={{ marginBottom: "24px" }}
        // bodyStyle={{ padding: "24px" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                <TagsOutlined style={{ color: "#1890ff" }} />
                จัดการคูปอง
              </Title>
              <Text type="secondary">
                สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า
              </Text>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              size="large"
            >
              เพิ่มคูปองใหม่
            </Button>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <CouponFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
      />

      {/* Table */}
      <CouponTable
        coupons={coupons}
        loading={loading}
        pagination={pagination}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create/Edit Modal */}
      <CouponModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitCoupon}
        initialData={editing}
        title={editing ? "แก้ไขคูปอง" : "เพิ่มคูปองใหม่"}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDeleteCoupon}
        coupon={couponToDelete}
        loading={deleting}
      />
    </div>
  );
}
