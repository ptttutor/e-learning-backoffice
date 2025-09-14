"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useAntdApp";
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
  const message = useMessage();
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

  // Use refs to avoid stale closure issues
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);
  const searchInputRef = useRef(searchInput);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchInputRef.current = searchInput;
  }, [searchInput]);

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

  // Fetch chapters with server-side filtering and pagination
  const fetchChapters = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      // Use refs to get current state values
      const currentPagination = paginationRef.current;
      const currentFilters = filtersRef.current;
      const currentSearchInput = searchInputRef.current;

      // Build query parameters
      const params = new URLSearchParams({
        courseId,
        page: currentPagination.page.toString(),
        pageSize: currentPagination.pageSize.toString(),
        sortBy: currentFilters.sortBy,
      });

      if (currentSearchInput.trim()) {
        params.append('search', currentSearchInput.trim());
      }
      if (currentFilters.minOrder) {
        params.append('minOrder', currentFilters.minOrder.toString());
      }

      const res = await fetch(`/api/admin/chapters?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setChapters(data.data || []);
        setPagination(data.pagination || {
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการโหลด chapters");
      }
    } catch (e) {
      console.error("Fetch chapters error:", e);
      message.error("เกิดข้อผิดพลาดในการโหลด chapters");
    }
    setLoading(false);
  }, [courseId]);

  // Debounced search function - ย้ายมาไว้หลัง fetchChapters
  const debouncedFetchChapters = useCallback(
    debounce(() => {
      if (courseId) {
        fetchChapters();
      }
    }, 500),
    [fetchChapters]
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

      // Refresh data และอัปเดต UI ทันที
      await Promise.all([fetchChapters(), fetchAllChapters()]);

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
    
    // อัปเดต chapters ด้วยเพื่อให้ pagination แสดงผลถูกต้อง
    setChapters(prevChapters => {
      // อัปเดตเฉพาะ chapters ที่อยู่ในหน้าปัจจุบัน
      return prevChapters.map(chapter => {
        const updatedChapter = newChapters.find(nc => nc.id === chapter.id);
        return updatedChapter || chapter;
      });
    });
    
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

  // Helper functions for optimistic updates
  const updateChapterInList = useCallback((chapterId, updatedData) => {
    setChapters(prevChapters => 
      prevChapters.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, ...updatedData }
          : chapter
      )
    );
    setAllChapters(prevChapters => 
      prevChapters.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, ...updatedData }
          : chapter
      )
    );
  }, []);

  const addChapterToList = useCallback((newChapter) => {
    setChapters(prevChapters => [newChapter, ...prevChapters]);
    setAllChapters(prevChapters => [newChapter, ...prevChapters]);
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1
    }));
  }, []);

  const removeChapterFromList = useCallback((chapterId) => {
    setChapters(prevChapters => prevChapters.filter(chapter => chapter.id !== chapterId));
    setAllChapters(prevChapters => prevChapters.filter(chapter => chapter.id !== chapterId));
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount - 1
    }));
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
    updateChapterInList,
    addChapterToList,
    removeChapterFromList,
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
