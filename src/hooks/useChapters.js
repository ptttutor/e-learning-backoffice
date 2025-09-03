"use client";
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";

export const useChapters = (courseId) => {
  const [chapters, setChapters] = useState([]);
  const [allChapters, setAllChapters] = useState([]); // สำหรับ drag & drop
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    minOrder: "",
    sortBy: "order_asc",
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // ปรับปรุง sensors สำหรับการลากที่ดีขึ้น
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // ต้องลากอย่างน้อย 8px ถึงจะเริ่มการลาก
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounced search function
  const debouncedFetchChapters = useCallback(
    debounce(() => {
      fetchChapters();
    }, 500),
    [courseId, searchInput, filters, pagination.page, pagination.pageSize]
  );

  // Apply filters และ search (ใช้ server-side)
  useEffect(() => {
    if (courseId) {
      debouncedFetchChapters();
    }
  }, [courseId, searchInput, filters, pagination.page, pagination.pageSize, debouncedFetchChapters]);

  // Fetch all chapters for drag & drop (without filters)
  const fetchAllChapters = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const res = await fetch(`/api/admin/chapters?courseId=${courseId}&pageSize=1000&sortBy=order_asc`);
      const data = await res.json();
      if (data.success) {
        setAllChapters(data.data || []);
        
        // เก็บ initial order เมื่อโหลดครั้งแรก
        const initOrder = (data.data || []).map((item) => ({
          id: item.id,
          order: item.order,
        }));
        setInitialOrder(initOrder);
      }
    } catch (e) {
      console.error("Error fetching all chapters:", e);
    }
  }, [courseId]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (paginationConfig, filtersConfig, sorter) => {
    setPagination((prev) => ({
      ...prev,
      page: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchInput("");
    setFilters({
      minOrder: "",
      sortBy: "order_asc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Fetch chapters with server-side filtering and pagination
  const fetchChapters = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        courseId,
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: filters.sortBy,
      });

      if (searchInput.trim()) {
        params.append('search', searchInput.trim());
      }
      if (filters.minOrder) {
        params.append('minOrder', filters.minOrder.toString());
      }

      const res = await fetch(`/api/admin/chapters?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setChapters(data.data || []);
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }));
      } else {
        message.error("โหลดข้อมูล chapter ไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Error fetching chapters:", e);
      message.error("โหลดข้อมูล chapter ไม่สำเร็จ");
    }
    setLoading(false);
  }, [courseId, searchInput, filters, pagination.page, pagination.pageSize]);

  // บันทึกการเปลี่ยนแปลงลำดับ
  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const updatePromises = allChapters.map((chapter) =>
        fetch(`/api/admin/chapters/${chapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: chapter.title,
            order: chapter.order,
          }),
        })
      );

      await Promise.all(updatePromises);

      // อัพเดต initial order ให้เป็นลำดับปัจจุบัน
      const newInitOrder = allChapters.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(newInitOrder);
      setHasUnsavedChanges(false);

      // Refresh data
      await fetchChapters();
      await fetchAllChapters();

      message.success("บันทึกการเปลี่ยนแปลงลำดับสำเร็จ");
    } catch (error) {
      console.error("Error saving order changes:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกลำดับ");
    }
    setSavingOrder(false);
  };

  // ยกเลิกการเปลี่ยนแปลงลำดับ
  const cancelOrderChanges = () => {
    if (initialOrder.length === 0) return;

    // เรียงลำดับ allChapters ตาม initial order
    const resetChapters = [...allChapters]
      .sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      })
      .map((chapter) => {
        const originalOrder =
          initialOrder.find((item) => item.id === chapter.id)?.order ||
          chapter.order;
        return { ...chapter, order: originalOrder };
      });

    setAllChapters(resetChapters);
    setHasUnsavedChanges(false);
    message.info("ยกเลิกการเปลี่ยนแปลงลำดับ");
  };

  // Reset order กลับไปเป็นค่าเริ่มต้น
  const resetOrder = async () => {
    if (initialOrder.length === 0) return;

    try {
      // เรียงลำดับ allChapters ตาม initial order
      const resetChapters = [...allChapters].sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      });

      setAllChapters(resetChapters);

      // อัพเดทในฐานข้อมูล
      const updatePromises = initialOrder.map((item) => {
        const chapter = allChapters.find((c) => c.id === item.id);
        return fetch(`/api/admin/chapters/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: chapter.title,
            order: item.order,
          }),
        });
      });

      await Promise.all(updatePromises);
      setHasUnsavedChanges(false);
      
      // Refresh data
      await fetchChapters();
      await fetchAllChapters();
      
      message.success("รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้นสำเร็จ");
    } catch (error) {
      console.error("Error resetting order:", error);
      message.error("เกิดข้อผิดพลาดในการรีเซ็ตลำดับ");
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end - ไม่บันทึกทันที แต่แสดงปุ่มยืนยัน
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // ใช้ allChapters สำหรับ drag & drop
    const oldIndex = allChapters.findIndex((item) => item.id === active.id);
    const newIndex = allChapters.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // อัพเดท state ทันที พร้อมกับอัพเดตเลขลำดับในตาราง
    const newChapters = arrayMove(allChapters, oldIndex, newIndex).map(
      (chapter, index) => ({
        ...chapter,
        order: index + 1, // อัพเดตเลขลำดับให้ตรงกับตำแหน่งใหม่
      })
    );

    setAllChapters(newChapters);
    setHasUnsavedChanges(true); // แสดงว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  useEffect(() => {
    if (courseId) {
      fetchAllChapters(); // Load all chapters for drag & drop
    }
  }, [courseId, fetchAllChapters]);

  // Page change handler
  const handlePageChange = useCallback((page, pageSize) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
  }, []);

  // Page size change handler  
  const handlePageSizeChange = useCallback((current, size) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: size }));
  }, []);

  return {
    chapters, // filtered chapters สำหรับแสดงผล
    allChapters, // chapters ทั้งหมดสำหรับ drag & drop
    initialOrder,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchChapters,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleFilterChange,
    handleTableChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
  };
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
