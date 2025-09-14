"use client";
import { useState, useEffect, useCallback } from "react";
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

export const useContents = (chapterId) => {
  const message = useMessage();
  const [contents, setContents] = useState([]); // filtered contents สำหรับแสดงผล
  const [allContents, setAllContents] = useState([]); // contents ทั้งหมดสำหรับ drag & drop
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    contentType: "",
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

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Handle table change (pagination)
  const handleTableChange = useCallback((paginationConfig) => {
    setPagination(prev => ({
      ...prev,
      page: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSearchInput("");
    setFilters({
      contentType: "",
      sortBy: "order_asc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Fetch contents with server-side filtering and pagination
  const fetchContents = useCallback(async () => {
    if (!chapterId) return;
    
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        chapterId,
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: filters.sortBy,
      });

      if (searchInput.trim()) {
        params.append('search', searchInput.trim());
      }
      if (filters.contentType) {
        params.append('contentType', filters.contentType);
      }

      const res = await fetch(`/api/admin/contents?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setContents(data.data || []);
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }));
      } else {
        message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
      }
    } catch (e) {
      message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
    }
    setLoading(false);
  }, [chapterId, searchInput, filters, pagination.page, pagination.pageSize]);

  // Fetch all contents for drag & drop operations
  const fetchAllContents = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      const res = await fetch(`/api/admin/contents?chapterId=${chapterId}&pageSize=1000&sortBy=order_asc`);
      const data = await res.json();
      
      if (data.success) {
        const sortedContents = (data.data || []).sort((a, b) => a.order - b.order);
        setAllContents(sortedContents);

        // เก็บ initial order เมื่อโหลดครั้งแรก
        const initOrder = sortedContents.map((item) => ({
          id: item.id,
          order: item.order,
        }));
        setInitialOrder(initOrder);
        setHasUnsavedChanges(false);
      }
    } catch (e) {
      message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
    }
  }, [chapterId]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== undefined) {
        fetchContents();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // Fetch all contents when chapter changes
  useEffect(() => {
    if (chapterId) {
      fetchAllContents();
      fetchContents();
    }
  }, [chapterId, fetchAllContents, fetchContents]);

  // บันทึกการเปลี่ยนแปลงลำดับ
  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const updatePromises = allContents.map((content) =>
        fetch(`/api/admin/contents/${content.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.title,
            contentType: content.contentType,
            contentUrl: content.contentUrl,
            order: content.order,
          }),
        })
      );

      await Promise.all(updatePromises);

      // อัพเดต initial order ให้เป็นลำดับปัจจุบัน
      const newInitOrder = allContents.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(newInitOrder);
      setHasUnsavedChanges(false);

      message.success("บันทึกการเปลี่ยนแปลงลำดับสำเร็จ");
      
      // Refresh ข้อมูลทั้งหมดและอัปเดต UI ทันที
      await Promise.all([fetchContents(), fetchAllContents()]);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกลำดับ");
    }
    setSavingOrder(false);
  };

  // ยกเลิกการเปลี่ยนแปลงลำดับ
  const cancelOrderChanges = () => {
    if (initialOrder.length === 0) return;

    // เรียงลำดับ allContents ตาม initial order
    const resetContents = [...allContents]
      .sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      })
      .map((content) => {
        const originalOrder =
          initialOrder.find((item) => item.id === content.id)?.order ||
          content.order;
        return { ...content, order: originalOrder };
      });

    setAllContents(resetContents);
    setHasUnsavedChanges(false);
    message.info("ยกเลิกการเปลี่ยนแปลงลำดับ");
    
    // Refresh filtered contents
    fetchContents();
  };

  // Reset order กลับไปเป็นค่าเริ่มต้น
  const resetOrder = async () => {
    if (initialOrder.length === 0) return;

    try {
      // เรียงลำดับ allContents ตาม initial order
      const resetContents = [...allContents].sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      });

      setAllContents(resetContents);

      // อัพเดทในฐานข้อมูล
      const updatePromises = initialOrder.map((item) => {
        const content = allContents.find((c) => c.id === item.id);
        return fetch(`/api/admin/contents/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.title,
            contentType: content.contentType,
            contentUrl: content.contentUrl,
            order: item.order,
          }),
        });
      });

      await Promise.all(updatePromises);
      setHasUnsavedChanges(false);
      message.success("รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้นสำเร็จ");
      
      // Refresh filtered contents
      fetchContents();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการรีเซ็ตลำดับ");
      fetchAllContents(); // Reload data on error
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

    const oldIndex = allContents.findIndex((item) => item.id === active.id);
    const newIndex = allContents.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // อัพเดท allContents state ทันที พร้อมกับอัพเดตเลขลำดับในตาราง
    const newContents = arrayMove(allContents, oldIndex, newIndex).map(
      (content, index) => ({
        ...content,
        order: index + 1, // อัพเดตเลขลำดับให้ตรงกับตำแหน่งใหม่
      })
    );

    setAllContents(newContents);
    
    // อัปเดต contents ด้วยเพื่อให้ pagination แสดงผลถูกต้อง
    setContents(prevContents => {
      // อัปเดตเฉพาะ contents ที่อยู่ในหน้าปัจจุบัน
      return prevContents.map(content => {
        const updatedContent = newContents.find(nc => nc.id === content.id);
        return updatedContent || content;
      });
    });
    
    setHasUnsavedChanges(true); // แสดงว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Page change handler
  const handlePageChange = useCallback((page, pageSize) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
  }, []);

  // Page size change handler  
  const handlePageSizeChange = useCallback((current, size) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: size }));
  }, []);

  // Helper functions for optimistic updates
  const updateContentInList = useCallback((contentId, updatedData) => {
    setContents(prevContents => 
      prevContents.map(content => 
        content.id === contentId 
          ? { ...content, ...updatedData }
          : content
      )
    );
    setAllContents(prevContents => 
      prevContents.map(content => 
        content.id === contentId 
          ? { ...content, ...updatedData }
          : content
      )
    );
  }, []);

  const addContentToList = useCallback((newContent) => {
    setContents(prevContents => [newContent, ...prevContents]);
    setAllContents(prevContents => [newContent, ...prevContents]);
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1
    }));
  }, []);

  const removeContentFromList = useCallback((contentId) => {
    setContents(prevContents => prevContents.filter(content => content.id !== contentId));
    setAllContents(prevContents => prevContents.filter(content => content.id !== contentId));
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount - 1
    }));
  }, []);

  return {
    contents, // filtered contents สำหรับแสดงผล
    allContents, // contents ทั้งหมดสำหรับ drag & drop
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
    fetchContents,
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
    updateContentInList,
    addContentToList,
    removeContentFromList,
  };
};
