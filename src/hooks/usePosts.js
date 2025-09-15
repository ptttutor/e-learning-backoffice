"use client";
import { useState, useEffect, useCallback } from 'react';
import { useMessage } from './useAntdApp';

export const usePosts = () => {
  const message = useMessage();
  const [posts, setPosts] = useState([]);
  const [postTypes, setPostTypes] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postTypesLoading, setPostTypesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    postTypeId: "",
    authorId: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "created_desc",
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
      postTypeId: "",
      authorId: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "created_desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Fetch posts with server-side filtering and pagination
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: filters.sortBy,
      });

      if (searchInput && searchInput.trim()) {
        params.append('search', searchInput.trim());
      }
      if (filters.postTypeId) {
        params.append('postTypeId', filters.postTypeId);
      }
      if (filters.authorId) {
        params.append('authorId', filters.authorId);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }

      const response = await fetch(`/api/admin/posts?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data || []);
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }));
      } else {
        message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์');
    } finally {
      setLoading(false);
    }
  }, [searchInput, filters, pagination.page, pagination.pageSize, message]);

  // Fetch post types
  const fetchPostTypes = useCallback(async () => {
    try {
      setPostTypesLoading(true);
      // ดึงข้อมูลทั้งหมดโดยไม่ใช้ pagination
      const response = await fetch('/api/admin/post-types?pageSize=1000&status=ALL');
      const data = await response.json();
      
      console.log('Post types API response:', data); // Debug log
      
      // API ส่งข้อมูลในรูปแบบ { success: true, data: [...] }
      const postTypesData = data.success && Array.isArray(data.data) ? data.data : [];
      console.log('Post types data after processing:', postTypesData); // Debug log
      
      setPostTypes(postTypesData);
    } catch (error) {
      console.error('Error fetching post types:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดประเภทโพสต์');
      setPostTypes([]);
    } finally {
      setPostTypesLoading(false);
    }
  }, [message]);

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);

      const response = await fetch('/api/admin/users?pageSize=1000&status=all&role=all');
      const data = await response.json();
      
      console.log('Authors API response:', data); // Debug log
      

      const authorsData = data.success && data.data?.users ? data.data.users : [];
      console.log('Authors data after processing:', authorsData); // Debug log
      
      setAuthors(authorsData);
    } catch (error) {
      console.error('Error fetching authors:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดผู้เขียน');
      setAuthors([]);
    } finally {
      setAuthorsLoading(false);
    }
  }, [message]);

  // Create or update post
  const savePost = async (postData, editingPost) => {
    try {
      const url = editingPost ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
      const method = editingPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        message.success(editingPost ? 'อัพเดทโพสต์สำเร็จ' : 'สร้างโพสต์สำเร็จ');
        await fetchPosts();
        return true;
      } else {
        message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        return false;
      }
    } catch (error) {
      console.error('Error saving post:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return false;
    }
  };

  // Delete post
  const deletePost = async (id) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        message.success('ลบโพสต์สำเร็จ');
        await fetchPosts();
        return true;
      } else {
        message.error('เกิดข้อผิดพลาดในการลบ');
        return false;
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      return false;
    }
  };

  // Page change handler
  const handlePageChange = useCallback((page, pageSize) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
  }, []);

  // Page size change handler  
  const handlePageSizeChange = useCallback((current, size) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: size }));
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== undefined) {
        fetchPosts();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Fetch when filters or pagination change (exclude search from this effect)
  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.page, pagination.pageSize]);

  // Initialize data only once
  useEffect(() => {
    fetchPostTypes();
    fetchAuthors();
    fetchPosts();
  }, []);

  return {
    posts,
    postTypes,
    authors,
    loading,
    postTypesLoading,
    authorsLoading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchPosts,
    fetchPostTypes,
    fetchAuthors,
    savePost,
    deletePost,
    handleFilterChange,
    handleTableChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
  };
};
