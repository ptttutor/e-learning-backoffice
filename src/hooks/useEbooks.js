"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMessage } from './useAntdApp';

export function useEbooks() {
  const message = useMessage();
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    status: "ALL",
    format: "",
    featured: "ALL",
    physical: "ALL",
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

  // Refs to track current values
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Fetch ebooks with filtering  
  const fetchEbooks = useCallback(async (customFilters, customPagination) => {
    setLoading(true);
    try {
      // Use default values if no custom parameters provided
      const defaultFilters = {
        search: "",
        categoryId: "",
        status: "ALL",
        format: "",
        featured: "ALL",
        physical: "ALL",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const defaultPagination = { page: 1, pageSize: 10 };
      
      // Use provided values or current ref values or defaults
      const filtersToUse = customFilters || filtersRef.current || defaultFilters;
      const paginationToUse = customPagination || paginationRef.current || defaultPagination;

      // Build query parameters
      const params = new URLSearchParams({
        page: paginationToUse.page?.toString() || '1',
        pageSize: paginationToUse.pageSize?.toString() || '10',
        search: filtersToUse.search || '',
        categoryId: filtersToUse.categoryId || '',
        status: filtersToUse.status || 'ALL',
        format: filtersToUse.format || '',
        featured: filtersToUse.featured || 'ALL',
        physical: filtersToUse.physical || 'ALL',
        sortBy: filtersToUse.sortBy || 'createdAt',
        sortOrder: filtersToUse.sortOrder || 'desc',
      });

      const response = await fetch(`/api/admin/ebooks?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        message.error(`Failed to fetch ebooks: ${errorData.error || 'Unknown error'}`);
        setEbooks([]);
        return;
      }
      const data = await response.json();
      
      if (data.success) {
        setEbooks(data.data || []);
        setPagination(data.pagination);
        // Only update filters if custom filters were provided
        if (customFilters) {
          setFilters(customFilters);
        }
      } else {
        setEbooks(data || []);
        // For backward compatibility if API doesn't return pagination
        setPagination(prev => ({ ...prev, totalCount: data.length }));
        // Only update filters if custom filters were provided
        if (customFilters) {
          setFilters(customFilters);
        }
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/ebook-categories');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error fetching categories:', errorData);
        message.error(`Failed to fetch categories: ${errorData.error || 'Unknown error'}`);
        setCategories([]); // Ensure categories is always an array
        return;
      }
      const data = await response.json();
      // Ensure data is an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
      setCategories([]); // Ensure categories is always an array
    }
  }, [message]); // Add message dependency

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const currentFilters = filtersRef.current;
    const currentPagination = paginationRef.current;
    const newFilters = { ...currentFilters, [key]: value };
    const newPagination = { page: 1, pageSize: currentPagination.pageSize || 10 };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchEbooks(newFilters, newPagination);
  }, []);

  // Handle table change (sorting, pagination)
  const handleTableChange = useCallback((paginationInfo, filtersInfo, sorter) => {
    const currentFilters = filtersRef.current;
    const newFilters = { ...currentFilters };
    const newPagination = {
      page: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    };

    // Handle sorting
    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    setFilters(newFilters);
    setPagination(prev => ({ ...prev, ...newPagination }));
    fetchEbooks(newFilters, newPagination);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFilters = {
      search: "",
      categoryId: "",
      status: "ALL",
      format: "",
      featured: "ALL",
      physical: "ALL",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    const resetPagination = { page: 1, pageSize: 10 };
    setSearchInput("");
    setFilters(resetFilters);
    setPagination(prev => ({ ...prev, ...resetPagination }));
    fetchEbooks(resetFilters, resetPagination);
  }, []);

  // Submit ebook (create or update)
  const submitEbook = async (values, editingEbook) => {
    try {
      const url = editingEbook ? `/api/admin/ebooks/${editingEbook.id}` : '/api/admin/ebooks';
      const method = editingEbook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.data };
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return { success: false, error: errorData.error || 'Unknown error' };
      }
    } catch (error) {
      console.error('Error saving ebook:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
    }
  };

  // Delete ebook
  const deleteEbook = async (id) => {
    try {
      console.log('Deleting ebook with ID:', id);
      
      const response = await fetch(`/api/admin/ebooks/${id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete API Error:', errorData);
        return false;
      }

      const data = await response.json();
      console.log('Delete response data:', data);

      if (data.success !== false) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting ebook:', error);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      const initialFilters = {
        search: "",
        categoryId: "",
        status: "ALL",
        format: "",
        featured: "ALL", 
        physical: "ALL",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const initialPagination = { page: 1, pageSize: 10 };
      await fetchEbooks(initialFilters, initialPagination);
    };
    loadInitialData();
  }, []); // Empty dependency array for initial load only

  // Debounce search - separate effect for search input
  useEffect(() => {
    if (!searchInput.trim()) {
      return; // Don't search for empty string
    }
    
    const timeoutId = setTimeout(() => {
      // Update filters with search term and trigger fetch
      const currentFilters = filtersRef.current;
      const currentPagination = paginationRef.current;
      const newFilters = { ...currentFilters, search: searchInput };
      const newPagination = { page: 1, pageSize: currentPagination.pageSize };
      fetchEbooks(newFilters, newPagination);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]); // Only depend on search input

  // Clean search when input is empty
  useEffect(() => {
    if (!searchInput.trim() && filtersRef.current.search) {
      const currentFilters = filtersRef.current;
      const currentPagination = paginationRef.current;
      const newFilters = { ...currentFilters, search: "" };
      setFilters(newFilters);
      fetchEbooks(newFilters, currentPagination);
    }
  }, [searchInput]); // Only depend on search input

  // Fetch ebook files (for the single fileUrl)
  const fetchEbookFile = useCallback(async (ebookId) => {
    try {
      console.log('fetchEbookFile called with ebookId:', ebookId);
      const response = await fetch(`/api/admin/ebooks/${ebookId}`);
      const result = await response.json();
      console.log('fetchEbookFile response:', response.ok, result);
      
      if (response.ok && result.fileUrl) {
        const files = [{
          id: `${ebookId}_file`,
          fileName: result.title + '.' + (result.format || 'pdf').toLowerCase(),
          filePath: result.fileUrl,
          fileSize: result.fileSize || 0,
          uploadedAt: result.updatedAt,
        }];
        console.log('Returning files:', files);
        return files;
      }
      console.log('No fileUrl found or response not ok');
      return [];
    } catch (error) {
      console.error("Error fetching ebook file:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดไฟล์");
      return [];
    }
  }, []);

  // Upload ebook file
  const uploadEbookFile = useCallback(async (ebookId, file) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ebookId', ebookId);

      const response = await fetch("/api/admin/ebook-files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Return result without auto refresh - let component handle the update
        return result.data;
      } else {
        return { error: result.error || "อัปโหลดไฟล์ไม่สำเร็จ" };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return { error: "เกิดข้อผิดพลาดในการอัปโหลด" };
    }
  }, []);

  // Delete ebook file
  const deleteEbookFile = useCallback(async (ebookId) => {
    try {
      const response = await fetch(`/api/admin/ebook-files/${ebookId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Return success without auto refresh - let component handle the update
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }, []);

  return {
    ebooks,
    setEbooks,
    categories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchEbooks,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    submitEbook,
    deleteEbook,
    fetchEbookFile,
    uploadEbookFile,
    deleteEbookFile,
  };
}