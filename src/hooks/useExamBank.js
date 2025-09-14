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
        const paginationData = data.pagination || {};
        setPagination({
          page: paginationData.page || 1,
          pageSize: paginationData.pageSize || 10,
          totalCount: paginationData.totalCount || 0,
          totalPages: Math.ceil((paginationData.totalCount || 0) / (paginationData.pageSize || 10)),
          hasNext: paginationData.page < Math.ceil((paginationData.totalCount || 0) / (paginationData.pageSize || 10)),
          hasPrev: (paginationData.page || 1) > 1,
        });
        console.log('Updated pagination:', paginationData);
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
    const tempId = `temp-${Date.now()}`;
    const newExam = {
      id: editingExam ? editingExam.id : tempId,
      title: examData.title,
      description: examData.description,
      categoryId: examData.categoryId,
      isActive: examData.isActive !== undefined ? examData.isActive : true,
      createdAt: editingExam ? editingExam.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: categories.find(cat => cat.id === examData.categoryId) || null,
      files: editingExam ? editingExam.files || [] : [],
      _count: { files: editingExam ? editingExam._count?.files || 0 : 0 },
      fileCount: editingExam ? editingExam.fileCount || 0 : 0,
    };

    // Optimistic update
    if (editingExam) {
      // Update existing exam
      setExams(prevExams => 
        prevExams.map(exam => exam.id === editingExam.id ? newExam : exam)
      );
    } else {
      // Add new exam at the beginning
      setExams(prevExams => [newExam, ...prevExams]);
      // Update pagination count
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1
      }));
    }

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
        // Replace temp data with real data from server
        if (editingExam) {
          setExams(prevExams => 
            prevExams.map(exam => exam.id === editingExam.id ? {
              ...result.data,
              category: categories.find(cat => cat.id === result.data.categoryId),
              files: result.data.files || [],
              _count: result.data._count || { files: 0 },
              fileCount: result.data.fileCount || 0
            } : exam)
          );
        } else {
          setExams(prevExams => 
            prevExams.map(exam => exam.id === tempId ? {
              ...result.data,
              category: categories.find(cat => cat.id === result.data.categoryId),
              files: result.data.files || [],
              _count: result.data._count || { files: 0 },
              fileCount: result.data.fileCount || 0
            } : exam)
          );
        }
        return true;
      } else {
        // Revert optimistic update on error
        if (editingExam) {
          setExams(prevExams => 
            prevExams.map(exam => exam.id === editingExam.id ? editingExam : exam)
          );
        } else {
          setExams(prevExams => prevExams.filter(exam => exam.id !== tempId));
          setPagination(prev => ({
            ...prev,
            totalCount: Math.max(0, prev.totalCount - 1)
          }));
        }
        message.error(result.error || "เกิดข้อผิดพลาด");
        return false;
      }
    } catch (error) {
      // Revert optimistic update on error
      if (editingExam) {
        setExams(prevExams => 
          prevExams.map(exam => exam.id === editingExam.id ? editingExam : exam)
        );
      } else {
        setExams(prevExams => prevExams.filter(exam => exam.id !== tempId));
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1)
        }));
      }
      console.error("Error saving exam:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
      return false;
    }
  };

  // Delete exam with optimistic update
  const deleteExam = async (examId) => {
    // Store original exam for potential rollback
    const examToDelete = exams.find(exam => exam.id === examId);
    
    // Optimistic update - remove exam immediately
    setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
    setPagination(prev => ({
      ...prev,
      totalCount: Math.max(0, prev.totalCount - 1)
    }));

    try {
      const response = await fetch(`/api/admin/exam-bank/${examId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        // Revert optimistic update on error
        if (examToDelete) {
          setExams(prevExams => [...prevExams, examToDelete]);
          setPagination(prev => ({
            ...prev,
            totalCount: prev.totalCount + 1
          }));
        }
        message.error(result.error || "เกิดข้อผิดพลาดในการลบ");
        return false;
      }
    } catch (error) {
      // Revert optimistic update on error
      if (examToDelete) {
        setExams(prevExams => [...prevExams, examToDelete]);
        setPagination(prev => ({
          ...prev,
          totalCount: prev.totalCount + 1
        }));
      }
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
    setExams,
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
