"use client";
import { useState, useEffect } from 'react';
import { message } from 'antd';

export function useEbooks() {
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

  // Fetch ebooks with filtering
  const fetchEbooks = async (customFilters = {}, customPagination = {}) => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, ...customFilters };
      const currentPagination = { ...pagination, ...customPagination };

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPagination.page.toString(),
        pageSize: currentPagination.pageSize.toString(),
        search: currentFilters.search,
        categoryId: currentFilters.categoryId,
        status: currentFilters.status,
        format: currentFilters.format,
        featured: currentFilters.featured,
        physical: currentFilters.physical,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      });

      const response = await fetch(`/api/admin/ebooks?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        message.error(`Failed to fetch ebooks: ${errorData.error}`);
        return;
      }
      const data = await response.json();
      
      if (data.success) {
        setEbooks(data.data || []);
        setPagination(data.pagination);
        setFilters(currentFilters);
      } else {
        setEbooks(data || []);
        // For backward compatibility if API doesn't return pagination
        setPagination(prev => ({ ...prev, totalCount: data.length }));
        setFilters(currentFilters);
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/ebook-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    fetchEbooks(newFilters, { page: 1 });
  };

  // Handle table change (sorting, pagination)
  const handleTableChange = (paginationInfo, filtersInfo, sorter) => {
    const newFilters = { ...filters };
    const newPagination = {
      page: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    };

    // Handle sorting
    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    fetchEbooks(newFilters, newPagination);
  };

  // Reset filters
  const resetFilters = () => {
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
    setSearchInput("");
    setFilters(resetFilters);
    fetchEbooks(resetFilters, { page: 1 });
  };

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
        message.success(editingEbook ? 'อัพเดท eBook สำเร็จ' : 'สร้าง eBook สำเร็จ');
        await fetchEbooks();
        return true;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        message.error(`Failed to save ebook: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error saving ebook:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return false;
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
        message.error(`Failed to delete ebook: ${errorData.error || 'Unknown error'}`);
        return false;
      }

      const data = await response.json();
      console.log('Delete response data:', data);

      if (data.success !== false) {
        message.success('ลบ eBook สำเร็จ');
        await fetchEbooks();
        return true;
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาดในการลบ');
        return false;
      }
    } catch (error) {
      console.error('Error deleting ebook:', error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchEbooks({}, { page: 1, pageSize: 10 });
    };
    loadInitialData();
  }, []); // Empty dependency array for initial load only

  // Debounce search - separate effect for search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Update filters with search term and trigger fetch
      const newFilters = { ...filters, search: searchInput };
      setFilters(newFilters);
      fetchEbooks(newFilters, { page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]); // Only depend on search input

  return {
    ebooks,
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
  };
}