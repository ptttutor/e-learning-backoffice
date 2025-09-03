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

export const useContents = (chapterId) => {
  const [contents, setContents] = useState([]);
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

  // Fetch contents
  const fetchContents = useCallback(async () => {
    if (!chapterId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contents?chapterId=${chapterId}`);
      const data = await res.json();
      // เรียงลำดับตาม order
      const sortedContents = (data.data || []).sort(
        (a, b) => a.order - b.order
      );
      setContents(sortedContents);

      // เก็บ initial order เมื่อโหลดครั้งแรก
      const initOrder = sortedContents.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(initOrder);
      setHasUnsavedChanges(false); // รีเซ็ตสถานะการเปลี่ยนแปลง
    } catch (e) {
      message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
    }
    setLoading(false);
  }, [chapterId]);

  // บันทึกการเปลี่ยนแปลงลำดับ
  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const updatePromises = contents.map((content) =>
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
      const newInitOrder = contents.map((item) => ({
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

    // เรียงลำดับ contents ตาม initial order
    const resetContents = [...contents]
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

    setContents(resetContents);
    setHasUnsavedChanges(false);
    message.info("ยกเลิกการเปลี่ยนแปลงลำดับ");
  };

  // Reset order กลับไปเป็นค่าเริ่มต้น
  const resetOrder = async () => {
    if (initialOrder.length === 0) return;

    try {
      // เรียงลำดับ contents ตาม initial order
      const resetContents = [...contents].sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      });

      setContents(resetContents);

      // อัพเดทในฐานข้อมูล
      const updatePromises = initialOrder.map((item) => {
        const content = contents.find((c) => c.id === item.id);
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
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการรีเซ็ตลำดับ");
      fetchContents(); // Reload data on error
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

    const oldIndex = contents.findIndex((item) => item.id === active.id);
    const newIndex = contents.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // อัพเดท state ทันที พร้อมกับอัพเดตเลขลำดับในตาราง
    const newContents = arrayMove(contents, oldIndex, newIndex).map(
      (content, index) => ({
        ...content,
        order: index + 1, // อัพเดตเลขลำดับให้ตรงกับตำแหน่งใหม่
      })
    );

    setContents(newContents);
    setHasUnsavedChanges(true); // แสดงว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  useEffect(() => {
    if (chapterId) fetchContents();
  }, [chapterId, fetchContents]);

  return {
    contents,
    initialOrder,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    fetchContents,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
