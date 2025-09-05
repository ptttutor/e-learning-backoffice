import { useState, useEffect, useCallback } from 'react';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    applicable: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => 
      `${range[0]}-${range[1]} จาก ${total} คูปอง`,
  });

  // Fetch coupons function
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        search: filters.search || '',
        type: filters.type || '',
        status: filters.status || '',
        applicable: filters.applicable || ''
      });

      const response = await fetch(`/api/admin/coupons?${params}`);
      
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }

      const result = await response.json();
      
      if (result.success) {
        setCoupons(result.data.coupons);
        setPagination(prev => ({
          ...prev,
          current: result.data.pagination.current,
          total: result.data.pagination.total,
        }));
      }
    } catch (error) {
      console.error('Fetch coupons error:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value 
    }));
    setPagination(prev => ({ 
      ...prev, 
      current: 1 
    }));
  }, []);

  // Handle table changes (pagination, sorting)
  const handleTableChange = useCallback((newPagination, _, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      status: '',
      applicable: ''
    });
    setSearchInput('');
    setPagination(prev => ({ 
      ...prev, 
      current: 1 
    }));
  }, []);

  // Apply search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange('search', searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, handleFilterChange]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCoupons,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
};
