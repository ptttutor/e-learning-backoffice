"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useAntdApp";

export function useExamCategories() {
  const message = useMessage();
  const [examCategories, setExamCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Server-side filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
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

  // Fetch exam categories with server-side filtering and pagination
  const fetchExamCategories = useCallback(async (customFilters, customPagination) => {
    setLoading(true);
    try {
      // ใช้ ref เพื่อได้ current state หรือใช้ parameters ที่ส่งมา
      const currentFilters = customFilters || filtersRef.current;
      const currentPagination = customPagination || paginationRef.current;

      const params = new URLSearchParams({
        page: (currentPagination.page || 1).toString(),
        pageSize: (currentPagination.pageSize || 10).toString(),
        search: currentFilters.search || "",
        sortBy: currentFilters.sortBy || "createdAt",
        sortOrder: currentFilters.sortOrder || "desc",
      });

      if (currentFilters.isActive !== "") {
        params.append("isActive", currentFilters.isActive);
      }

      const response = await fetch(`/api/admin/exam-categories?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        message.error(`Failed to fetch exam categories: ${errorData.error || "Unknown error"}`);
        setExamCategories([]);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setExamCategories(data.data);
        setPagination(data.pagination);
      } else {
        console.error("API returned error:", data);
        message.error(data.error || "Failed to fetch exam categories");
        setExamCategories([]);
      }
    } catch (error) {
      console.error("Error fetching exam categories:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่ข้อสอบ");
      setExamCategories([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // Create new exam category
  const createExamCategory = useCallback(async (categoryData) => {
    try {
      const response = await fetch("/api/admin/exam-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (data.success) {
        message.success("สร้างหมวดหมู่ข้อสอบสำเร็จ");
        // Refresh the list
        await fetchExamCategories();
        return { success: true, data: data.data };
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการสร้างหมวดหมู่ข้อสอบ");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error creating exam category:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างหมวดหมู่ข้อสอบ");
      return { success: false, error: error.message };
    }
  }, [message, fetchExamCategories]);

  // Update exam category
  const updateExamCategory = useCallback(async (id, categoryData) => {
    try {
      const response = await fetch(`/api/admin/exam-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (data.success) {
        message.success("อัพเดทหมวดหมู่ข้อสอบสำเร็จ");
        // Refresh the list
        await fetchExamCategories();
        return { success: true, data: data.data };
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่ข้อสอบ");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error updating exam category:", error);
      message.error("เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่ข้อสอบ");
      return { success: false, error: error.message };
    }
  }, [message, fetchExamCategories]);

  // Delete exam category
  const deleteExamCategory = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/admin/exam-categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        message.success("ลบหมวดหมู่ข้อสอบสำเร็จ");
        // Refresh the list
        await fetchExamCategories();
        return { success: true };
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่ข้อสอบ");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error deleting exam category:", error);
      message.error("เกิดข้อผิดพลาดในการลบหมวดหมู่ข้อสอบ");
      return { success: false, error: error.message };
    }
  }, [message, fetchExamCategories]);

  // Toggle exam category status
  const toggleExamCategoryStatus = useCallback(async (id, isActive) => {
    try {
      const response = await fetch(`/api/admin/exam-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        message.success(`${isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}หมวดหมู่ข้อสอบสำเร็จ`);
        // Update local state without full refresh
        setExamCategories(prev => 
          prev.map(category => 
            category.id === id ? { ...category, isActive } : category
          )
        );
        return { success: true };
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะหมวดหมู่ข้อสอบ");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error toggling exam category status:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะหมวดหมู่ข้อสอบ");
      return { success: false, error: error.message };
    }
  }, [message]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination,
    }));
  }, []);

  // Search function
  const handleSearch = useCallback(() => {
    const newFilters = { ...filters, search: searchInput };
    const newPagination = { ...pagination, page: 1 };
    
    setFilters(newFilters);
    setPagination(newPagination);
    
    fetchExamCategories(newFilters, newPagination);
  }, [filters, pagination, searchInput, fetchExamCategories]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    const newFilters = { ...filters, search: "" };
    const newPagination = { ...pagination, page: 1 };
    
    setFilters(newFilters);
    setPagination(newPagination);
    
    fetchExamCategories(newFilters, newPagination);
  }, [filters, pagination, fetchExamCategories]);

  // Change page
  const handlePageChange = useCallback((page, pageSize) => {
    const newPagination = { ...pagination, page, pageSize };
    setPagination(newPagination);
    fetchExamCategories(filters, newPagination);
  }, [pagination, filters, fetchExamCategories]);

  // Change sort
  const handleSortChange = useCallback((sortBy, sortOrder = "desc") => {
    const newFilters = { ...filters, sortBy, sortOrder };
    const newPagination = { ...pagination, page: 1 };
    
    setFilters(newFilters);
    setPagination(newPagination);
    
    fetchExamCategories(newFilters, newPagination);
  }, [filters, pagination, fetchExamCategories]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchExamCategories();
    };

    loadInitialData();
  }, []);

  return {
    // State
    examCategories,
    setExamCategories,
    loading,
    filters,
    pagination,
    searchInput,
    setSearchInput,

    // Functions
    fetchExamCategories,
    createExamCategory,
    updateExamCategory,
    deleteExamCategory,
    toggleExamCategoryStatus,
    updateFilters,
    updatePagination,
    handleSearch,
    handleClearSearch,
    handlePageChange,
    handleSortChange,
  };
}