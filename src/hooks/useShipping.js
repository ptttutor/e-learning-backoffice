"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useAntdApp";

export function useShipping() {
  const message = useMessage();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Server-side filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    shippingMethod: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Use ref to keep track of current state
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Fetch shipments with server-side filtering and pagination
  const fetchShipments = useCallback(async (customFilters, customPagination) => {
    setLoading(true);
    try {
      // ใช้ ref เพื่อได้ current state หรือใช้ parameters ที่ส่งมา
      const currentFilters = customFilters || filtersRef.current;
      const currentPagination = customPagination || paginationRef.current;

      // สร้าง query string สำหรับ API request
      const params = new URLSearchParams({
        page: currentPagination.page.toString(),
        pageSize: currentPagination.pageSize.toString(),
        search: currentFilters.search || "",
        status: currentFilters.status || "ALL",
        shippingMethod: currentFilters.shippingMethod || "",
        startDate: currentFilters.startDate || "",
        endDate: currentFilters.endDate || "",
        sortBy: currentFilters.sortBy || "createdAt",
        sortOrder: currentFilters.sortOrder || "desc",
      });

      const response = await fetch(`/api/admin/shipping?${params}`);
      const result = await response.json();

      if (result.success) {
        setShipments(result.data);
        setPagination(prev => ({
          ...prev,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }));
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการโหลดข้อมูลการจัดส่ง");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [message]);

  // Fetch shipment detail
  const fetchShipmentDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/shipping/${id}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียด");
        return null;
      }
    } catch (error) {
      console.error("Error fetching shipment detail:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, [message]);

  // Update shipment
  const updateShipment = useCallback(async (id, updateData) => {
    try {
      const response = await fetch(`/api/admin/shipping/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        message.success("อัพเดทข้อมูลการจัดส่งสำเร็จ");
        // Refresh data
        fetchShipments();
        return true;
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
        return false;
      }
    } catch (error) {
      console.error("Error updating shipment:", error);
      message.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
      return false;
    }
  }, [message, fetchShipments]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Handle table changes (pagination, sorting)
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    // Update pagination
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));

    // Update sorting
    if (sorter && sorter.field) {
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      setFilters(prev => ({
        ...prev,
        sortBy: sorter.field,
        sortOrder,
      }));
    }
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFilters = {
      search: "",
      status: "ALL",
      shippingMethod: "",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    setSearchInput("");
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Search function with debouncing
  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchInput]);

  // Load data when filters or pagination change
  useEffect(() => {
    fetchShipments();
  }, [filters, pagination.page, pagination.pageSize]);

  // Initial load
  useEffect(() => {
    fetchShipments();
  }, []);

  return {
    // Data
    shipments,
    setShipments,
    loading,
    detailLoading,
    
    // Filters and pagination
    filters,
    searchInput,
    setSearchInput,
    pagination,
    
    // Functions
    fetchShipments,
    fetchShipmentDetail,
    updateShipment,
    handleFilterChange,
    handleTableChange,
    handleSearch,
    resetFilters,
  };
}