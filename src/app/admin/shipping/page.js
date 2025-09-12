"use client";
import { useState } from "react";
import { Card, Typography, Space } from "antd";
import { TruckOutlined } from "@ant-design/icons";

// Components
import ShippingFilters from "@/components/admin/shipping/ShippingFilters";
import ShippingTable from "@/components/admin/shipping/ShippingTable";
import ShippingModal from "@/components/admin/shipping/ShippingModal";
import ShippingDetailModal from "@/components/admin/shipping/ShippingDetailModal";

// Hooks
import { useShipping } from "@/hooks/useShipping";

const { Title, Text } = Typography;

export default function AdminShippingPage() {
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailShipment, setDetailShipment] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Use custom hook for shipping data
  const {
    shipments,
    loading,
    detailLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchShipmentDetail,
    updateShipment,
    handleFilterChange,
    handleTableChange,
    handleSearch,
    resetFilters,
  } = useShipping();

  // Handle view detail
  const handleViewDetail = async (shipment) => {
    setDetailModalOpen(true);
    const detail = await fetchShipmentDetail(shipment.id);
    if (detail) {
      setDetailShipment(detail);
    } else {
      setDetailModalOpen(false);
    }
  };

  // Handle edit
  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setEditModalOpen(true);
  };

  // Handle update submission
  const handleUpdateSubmit = async (values) => {
    setUpdating(true);
    try {
      const success = await updateShipment(selectedShipment.id, values);
      if (success) {
        setEditModalOpen(false);
        setSelectedShipment(null);
      }
      return success;
    } finally {
      setUpdating(false);
    }
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
            <TruckOutlined style={{ marginRight: "8px" }} />
            จัดการการจัดส่ง
          </Title>
          <Text type="secondary">ติดตามและอัพเดทสถานะการจัดส่งสินค้า</Text>
        </Space>
      </Card>

      {/* Filters */}
      <ShippingFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={resetFilters}
        totalCount={pagination.totalCount}
        currentCount={shipments.length}
      />

      {/* Table */}
      <Card>
        <ShippingTable
          shipments={shipments}
          loading={loading}
          pagination={pagination}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Edit Modal */}
      <ShippingModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedShipment(null);
        }}
        onSubmit={handleUpdateSubmit}
        loading={updating}
        shipment={selectedShipment}
      />

      {/* Detail Modal */}
      <ShippingDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailShipment(null);
        }}
        shipment={detailShipment}
        loading={detailLoading}
      />
    </div>
  );
}