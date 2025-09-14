import { useState, useEffect, useCallback } from 'react';
import { useMessage } from './useAntdApp';

export const useCourseExams = (courseId) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const message = useMessage();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    examType: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch exams data
  const fetchExams = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        courseId,
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: filters.search,
        examType: filters.examType,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/admin/course-exams?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setExams(data.data);
        setPagination(prev => ({
          ...prev,
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        message.error(data.error || 'ไม่สามารถโหลดข้อมูลข้อสอบได้');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบ');
    } finally {
      setLoading(false);
    }
  }, [courseId, filters, pagination.page, pagination.pageSize]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (paginationInfo, filtersInfo, sorter) => {
    // Update pagination
    if (paginationInfo) {
      setPagination(prev => ({
        ...prev,
        page: paginationInfo.current,
        pageSize: paginationInfo.pageSize,
      }));
    }

    // Update sorting
    if (sorter && sorter.field) {
      setFilters(prev => ({
        ...prev,
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      examType: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Update search filter when searchInput changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleFilterChange('search', searchInput);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchInput]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return {
    exams,
    loading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchExams,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
};
