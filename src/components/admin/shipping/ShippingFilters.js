"use client";
import { Input, Select, DatePicker, Button, Typography, Space, Card } from "antd";
import { SearchOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function ShippingFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onSearch,
  onReset,
  totalCount,
  currentCount,
}) {
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "ALL") count++;
    if (filters.shippingMethod) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card size="small" style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Title and Summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <FilterOutlined />
            <Text strong>ตัวกรองข้อมูล</Text>
            {activeFilterCount > 0 && (
              <Text type="secondary">({activeFilterCount} ตัวกรองที่เลือก)</Text>
            )}
          </Space>
          <Text type="secondary">
            แสดง {currentCount} จาก {totalCount} รายการ
          </Text>
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "end",
          }}
        >
          {/* Search */}
          <div style={{ minWidth: "250px", flex: 1 }}>
            <Text strong>ค้นหา:</Text>
            <Input
              placeholder="ค้นหารหัสคำสั่งซื้อ, ชื่อผู้รับ, เบอร์โทร"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={onSearch}
              allowClear
              onClear={() => setSearchInput("")}
              style={{ marginTop: "4px" }}
              suffix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: "150px" }}>
            <Text strong>สถานะ:</Text>
            <Select
              value={filters.status}
              onChange={(value) => onFilterChange({ status: value })}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="เลือกสถานะ"
            >
              <Option value="ALL">ทั้งหมด</Option>
              <Option value="PENDING">รอดำเนินการ</Option>
              <Option value="PROCESSING">กำลังเตรียม</Option>
              <Option value="SHIPPED">จัดส่งแล้ว</Option>
              <Option value="DELIVERED">ส่งถึงแล้ว</Option>
              <Option value="CANCELLED">ยกเลิก</Option>
            </Select>
          </div>

          {/* Shipping Method Filter */}
          <div style={{ minWidth: "150px" }}>
            <Text strong>บริษัทขนส่ง:</Text>
            <Select
              value={filters.shippingMethod}
              onChange={(value) => onFilterChange({ shippingMethod: value })}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="เลือกบริษัท"
              allowClear
            >
              <Option value="KERRY">Kerry Express</Option>
              <Option value="THAILAND_POST">ไปรษณีย์ไทย</Option>
              <Option value="JT_EXPRESS">J&T Express</Option>
              <Option value="FLASH_EXPRESS">Flash Express</Option>
              <Option value="NINJA_VAN">Ninja Van</Option>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div style={{ minWidth: "250px" }}>
            <Text strong>ช่วงวันที่:</Text>
            <RangePicker
              value={filters.startDate && filters.endDate ? [
                filters.startDate,
                filters.endDate
              ] : null}
              onChange={(dates) => {
                if (dates) {
                  onFilterChange({
                    startDate: dates[0],
                    endDate: dates[1]
                  });
                } else {
                  onFilterChange({
                    startDate: "",
                    endDate: ""
                  });
                }
              }}
              style={{ width: "100%", marginTop: "4px" }}
              placeholder={["วันที่เริ่ม", "วันที่สิ้นสุด"]}
              allowClear
            />
          </div>

          {/* Sort Options */}
          <div style={{ minWidth: "150px" }}>
            <Text strong>เรียงตาม:</Text>
            <Select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split('_');
                onFilterChange({ sortBy, sortOrder });
              }}
              style={{ width: "100%", marginTop: "4px" }}
            >
              <Option value="createdAt_desc">วันที่สร้าง (ใหม่ล่าสุด)</Option>
              <Option value="createdAt_asc">วันที่สร้าง (เก่าสุด)</Option>
              <Option value="shippedAt_desc">วันที่จัดส่ง (ใหม่ล่าสุด)</Option>
              <Option value="shippedAt_asc">วันที่จัดส่ง (เก่าสุด)</Option>
              <Option value="recipientName_asc">ชื่อผู้รับ (A-Z)</Option>
              <Option value="recipientName_desc">ชื่อผู้รับ (Z-A)</Option>
            </Select>
          </div>

          {/* Action Buttons */}
          <Space>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={onSearch}
            >
              ค้นหา
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={onReset}
              disabled={activeFilterCount === 0}
            >
              รีเซ็ต
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
}