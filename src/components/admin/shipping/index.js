"use client";
import { useState } from "react";
import { Card, Typography, Space } from "antd";
import { TruckOutlined } from "@ant-design/icons";

// Components
import ShippingFilters from "./ShippingFilters";
import ShippingTable from "./ShippingTable";
import ShippingModal from "./ShippingModal";
import ShippingDetailModal from "./ShippingDetailModal";

// Hooks
import { useShipping } from "@/hooks/useShipping";
import { useMessage } from "@/hooks/useAntdApp";

const { Title, Text } = Typography;

export default function AdminShippingPage() {
  const message = useMessage();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailShipment, setDetailShipment] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Use custom hook for shipping data
  const {
    shipments,
    setShipments,
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

  // Handle view detail with loading state
  const handleViewDetail = async (shipment) => {
    setDetailModalOpen(true);
    setDetailShipment(null); // Reset previous data
    
    try {
      const detail = await fetchShipmentDetail(shipment.id);
      if (detail) {
        setDetailShipment(detail);
      } else {
        setDetailModalOpen(false);
        message.error("ไม่สามารถโหลดรายละเอียดการจัดส่งได้");
      }
    } catch (error) {
      console.error("Error fetching shipment detail:", error);
      setDetailModalOpen(false);
      message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
    }
  };

  // Handle edit
  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setEditModalOpen(true);
  };

  // Handle update submission with optimistic updates
  const handleUpdateSubmit = async (values) => {
    setUpdating(true);
    try {
      if (!selectedShipment?.id) {
        message.error("ไม่พบข้อมูลการจัดส่งที่จะอัพเดท");
        return false;
      }

      // Optimistic update - อัพเดท UI ทันที
      const originalShipment = selectedShipment;
      const updatedShipment = {
        ...originalShipment,
        ...values,
        updatedAt: new Date().toISOString(),
      };

      // อัพเดทในรายการทันที
      setShipments(prevShipments => 
        prevShipments.map(shipment => 
          shipment.id === selectedShipment.id ? updatedShipment : shipment
        )
      );

      try {
        const success = await updateShipment(selectedShipment.id, values);
        
        if (success) {
          message.success("อัพเดทสถานะการจัดส่งสำเร็จ");
          setEditModalOpen(false);
          setSelectedShipment(null);
          return true;
        } else {
          // Rollback optimistic update on error
          setShipments(prevShipments => 
            prevShipments.map(shipment => 
              shipment.id === selectedShipment.id ? originalShipment : shipment
            )
          );
          message.error("อัพเดทสถานะการจัดส่งไม่สำเร็จ");
          return false;
        }
      } catch (error) {
        // Rollback optimistic update on error
        setShipments(prevShipments => 
          prevShipments.map(shipment => 
            shipment.id === selectedShipment.id ? originalShipment : shipment
          )
        );
        console.error("Error updating shipment:", error);
        message.error("เกิดข้อผิดพลาดในการอัพเดทสถานะ");
        return false;
      }
    } catch (error) {
      console.error("Error in handleUpdateSubmit:", error);
      message.error("เกิดข้อผิดพลาดไม่คาดคิด");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedShipment(null);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setDetailShipment(null);
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
          updatingId={updating ? selectedShipment?.id : null}
        />
      </Card>

      {/* Edit Modal */}
      <ShippingModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateSubmit}
        loading={updating}
        shipment={selectedShipment}
      />

      {/* Detail Modal */}
      <ShippingDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        shipment={detailShipment}
        loading={detailLoading}
      />
    </div>
  );
}