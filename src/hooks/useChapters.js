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
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

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

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chapters?courseId=${courseId}`);
      const data = await res.json();
      
      // เรียงลำดับตาม order
      const sortedChapters = (data.data || []).sort(
        (a, b) => a.order - b.order
      );
      setChapters(sortedChapters);

      // เก็บ initial order เมื่อโหลดครั้งแรก
      const initOrder = sortedChapters.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(initOrder);
      setHasUnsavedChanges(false); // รีเซ็ตสถานะการเปลี่ยนแปลง
    } catch (e) {
      message.error("โหลดข้อมูล chapter ไม่สำเร็จ");
    }
    setLoading(false);
  }, [courseId]);

  // บันทึกการเปลี่ยนแปลงลำดับ
  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const updatePromises = chapters.map((chapter) =>
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
      const newInitOrder = chapters.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(newInitOrder);
      setHasUnsavedChanges(false);

      message.success("บันทึกการเปลี่ยนแปลงลำดับสำเร็จ");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกลำดับ");
    }
    setSavingOrder(false);
  };

  // ยกเลิกการเปลี่ยนแปลงลำดับ
  const cancelOrderChanges = () => {
    if (initialOrder.length === 0) return;

    // เรียงลำดับ chapters ตาม initial order
    const resetChapters = [...chapters]
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

    setChapters(resetChapters);
    setHasUnsavedChanges(false);
    message.info("ยกเลิกการเปลี่ยนแปลงลำดับ");
  };

  // Reset order กลับไปเป็นค่าเริ่มต้น
  const resetOrder = async () => {
    if (initialOrder.length === 0) return;

    try {
      // เรียงลำดับ chapters ตาม initial order
      const resetChapters = [...chapters].sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      });

      setChapters(resetChapters);

      // อัพเดทในฐานข้อมูล
      const updatePromises = initialOrder.map((item) => {
        const chapter = chapters.find((c) => c.id === item.id);
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
      message.success("รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้นสำเร็จ");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการรีเซ็ตลำดับ");
      fetchChapters(); // Reload data on error
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

    const oldIndex = chapters.findIndex((item) => item.id === active.id);
    const newIndex = chapters.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // อัพเดท state ทันที พร้อมกับอัพเดตเลขลำดับในตาราง
    const newChapters = arrayMove(chapters, oldIndex, newIndex).map(
      (chapter, index) => ({
        ...chapter,
        order: index + 1, // อัพเดตเลขลำดับให้ตรงกับตำแหน่งใหม่
      })
    );

    setChapters(newChapters);
    setHasUnsavedChanges(true); // แสดงว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  useEffect(() => {
    if (courseId) fetchChapters();
  }, [courseId, fetchChapters]);

  return {
    chapters,
    initialOrder,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    fetchChapters,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
