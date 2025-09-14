import { useState, useEffect, useCallback } from 'react';
import { useMessage } from './useAntdApp';

export const useExamQuestions = (examId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const message = useMessage();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    questionType: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch questions data
  const fetchQuestions = useCallback(async () => {
    if (!examId) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        examId,
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: filters.search,
        questionType: filters.questionType,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/admin/exam-questions?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
        setPagination(prev => ({
          ...prev,
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        message.error(data.error || 'ไม่สามารถโหลดข้อมูลคำถามได้');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม');
    } finally {
      setLoading(false);
    }
  }, [examId, filters, pagination.page, pagination.pageSize]);

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
      questionType: '',
      sortBy: 'createdAt',
      sortOrder: 'asc',
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
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchQuestions,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
};
