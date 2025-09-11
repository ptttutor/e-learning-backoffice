import { useState, useEffect, useMemo, useCallback } from "react";
import { useMessage } from "./useAntdApp";

export const useUsers = () => {
  const message = useMessage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Stats data
  const stats = useMemo(() => {
    if (!users.length) return { total: 0, students: 0, instructors: 0, admins: 0 };

    return {
      total: users.length,
      students: users.filter(user => user.role === 'STUDENT').length,
      instructors: users.filter(user => user.role === 'INSTRUCTOR').length,
      admins: users.filter(user => user.role === 'ADMIN').length,
    };
  }, [users]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination?.current || 1).toString(),
        limit: (pagination?.pageSize || 10).toString(),
        search: filters.search || "",
        role: filters.role || "all",
        status: filters.status || "all",
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(prev => ({
          ...prev,
          total: data.data.total,
          current: data.data.page,
        }));
      } else {
        try {
          message.error(`${data.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}`);
        } catch (msgError) {
          console.error("Message display error:", msgError);
        }
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      try {
        message.error(`เกิดข้อผิดพลาด: ${error.message}`);
      } catch (msgError) {
        console.error("Message display error:", msgError);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  }, []);

  // Handle table changes (pagination, sorting)
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));

    if (sorter && sorter.field) {
      setFilters(prev => ({
        ...prev,
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  }, []);

  // Apply search with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, handleFilterChange]);

  // Fetch data when filters or pagination change
  useEffect(() => {
    if (pagination && pagination.current && pagination.pageSize) {
      fetchUsers();
    }
  }, [fetchUsers, pagination]);

  return {
    users,
    loading,
    stats,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchUsers,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
};
