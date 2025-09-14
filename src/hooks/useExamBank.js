"use client";
import { useState, useEffect } from "react";
import { useMessage } from "./useAntdApp";

export function useExamBank() {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const message = useMessage();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    minFiles: "",
    maxFiles: "",
    sortBy: "createdAt",
    sortOrder: "desc",
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

  // Fetch exams (with explicit parameters to avoid dependency issues)
  const fetchExams = async (filterParams = null, paginationParams = null) => {
    setLoading(true);
    try {
      const currentFilters = filterParams || filters;
      const currentPagination = paginationParams || pagination;

      const params = new URLSearchParams({
        page: currentPagination.page?.toString() || "1",
        pageSize: currentPagination.pageSize?.toString() || "10",
        search: currentFilters.search || "",
        categoryId: currentFilters.categoryId || "",
        sortBy: currentFilters.sortBy || "createdAt",
        sortOrder: currentFilters.sortOrder || "desc",
      });

      if (currentFilters.minFiles)
        params.append("minFiles", currentFilters.minFiles);
      if (currentFilters.maxFiles)
        params.append("maxFiles", currentFilters.maxFiles);

      const res = await fetch(`/api/admin/exam-bank?${params}`);
      const data = await res.json();

      if (data.success) {
        setExams(data.data || []);
        setPagination(data.pagination || {});
      } else {
        message.error(data.error || "โหลดข้อมูลข้อสอบไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Fetch exams error:", e);
      message.error("โหลดข้อมูลข้อสอบไม่สำเร็จ");
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/exam-categories");
      const data = await res.json();
      setCategories(data.success ? data.data || [] : []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setCatLoading(false);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    const newPagination = { ...pagination, page: 1 };
    
    setFilters(newFilters);
    setPagination(newPagination);
    fetchExams(newFilters, newPagination);
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (paginationObj, filtersObj, sorter) => {
    const newPagination = {
      ...pagination,
      page: paginationObj.current,
      pageSize: paginationObj.pageSize,
    };

    let newFilters = { ...filters };
    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }
    
    setFilters(newFilters);
    setPagination(newPagination);
    fetchExams(newFilters, newPagination);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      categoryId: "",
      minFiles: "",
      maxFiles: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    
    const defaultPagination = { ...pagination, page: 1 };
    
    setFilters(defaultFilters);
    setSearchInput("");
    setPagination(defaultPagination);
    fetchExams(defaultFilters, defaultPagination);
  };

  // Save exam
  const saveExam = async (examData, editingExam) => {
    try {
      const url = editingExam
        ? `/api/admin/exam-bank/${editingExam.id}`
        : "/api/admin/exam-bank";
      
      const method = editingExam ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });

      const result = await response.json();

      if (result.success) {
        message.success(editingExam ? "แก้ไขข้อสอบสำเร็จ" : "สร้างข้อสอบสำเร็จ");
        await fetchExams();
        return true;
      } else {
        message.error(result.error || "เกิดข้อผิดพลาด");
        return false;
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
      return false;
    }
  };

  // Delete exam
  const deleteExam = async (examId) => {
    try {
      const response = await fetch(`/api/admin/exam-bank/${examId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        message.success("ลบข้อสอบสำเร็จ");
        await fetchExams();
        return true;
      } else {
        message.error(result.error || "เกิดข้อผิดพลาดในการลบ");
        return false;
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      message.error("เกิดข้อผิดพลาดในการลบ");
      return false;
    }
  };

  // Fetch exam files
  const fetchExamFiles = async (examId) => {
    try {
      const response = await fetch(`/api/admin/exam-files?examId=${examId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        message.error("โหลดไฟล์ข้อสอบไม่สำเร็จ");
        return [];
      }
    } catch (error) {
      console.error("Error fetching exam files:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดไฟล์");
      return [];
    }
  };

  // Upload exam file
  const uploadExamFile = async (examId, file) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examId);

      const response = await fetch("/api/admin/exam-files", {
        method: "POST",
        body: formData, // Use FormData instead of JSON
      });

      const result = await response.json();

      if (result.success) {
        message.success("อัปโหลดไฟล์สำเร็จ");
        return result.data;
      } else {
        message.error(result.error || "อัปโหลดไฟล์ไม่สำเร็จ");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("เกิดข้อผิดพลาดในการอัปโหลด");
      return null;
    }
  };

  // Delete exam file
  const deleteExamFile = async (fileId) => {
    console.log('Attempting to delete file with ID:', fileId);
    try {
      const response = await fetch(`/api/admin/exam-files/${fileId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log('Delete response:', result);

      if (result.success) {
        message.success("ลบไฟล์สำเร็จ");
        return true;
      } else {
        message.error(result.error || "ลบไฟล์ไม่สำเร็จ");
        return false;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error("เกิดข้อผิดพลาดในการลบไฟล์");
      return false;
    }
  };

  // Initial load - only run once on mount
  useEffect(() => {
    fetchCategories();
    fetchExams();
  }, []); // No dependencies to prevent infinite loop

  // Search debounce effect
  useEffect(() => {
    if (filters.search === searchInput) return; // Avoid loop if already equal

    const timeoutId = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput };
      const newPagination = { ...pagination, page: 1 };
      
      setFilters(newFilters);
      setPagination(newPagination);
      fetchExams(newFilters, newPagination);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]); // Only depend on searchInput

  return {
    exams,
    loading,
    categories,
    catLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchExams,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    saveExam,
    deleteExam,
    fetchExamFiles,
    uploadExamFile,
    deleteExamFile,
  };
}
