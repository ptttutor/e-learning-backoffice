"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useAntdApp";

export function usePostCategories() {
  const message = useMessage();
  const [postCategories, setPostCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Server-side filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
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

  // Use ref to track current filters for cleanup
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Fetch post categories with filters and pagination
  const fetchPostCategories = useCallback(async (customFilters = null, customPagination = null) => {
    setLoading(true);
    const currentFilters = customFilters || filtersRef.current;
    const currentPagination = customPagination || pagination;

    try {
      const params = new URLSearchParams({
        page: (currentPagination?.page || 1).toString(),
        pageSize: (currentPagination?.pageSize || 10).toString(),
        search: currentFilters?.search || "",
        status: currentFilters?.status || "ALL",
        sortBy: currentFilters?.sortBy || "createdAt",
        sortOrder: currentFilters?.sortOrder || "desc",
      });

      const res = await fetch(`/api/admin/post-types?${params}`);
      const data = await res.json();

      if (data.success) {
        setPostCategories(data.data || []);
        setPagination({
          page: data.pagination?.page || 1,
          pageSize: data.pagination?.pageSize || 10,
          totalCount: data.pagination?.totalCount || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
        if (customFilters) {
          setFilters(currentFilters);
        }
      } else {
        message.error(data.error || "โหลดข้อมูลหมวดหมู่โพสต์ไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Fetch post categories error:", e);
      message.error("โหลดข้อมูลหมวดหมู่โพสต์ไม่สำเร็จ");
    }
    setLoading(false);
  }, [pagination, message]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    fetchPostCategories(newFilters, { page: 1, pageSize: pagination.pageSize });
  }, [fetchPostCategories, pagination.pageSize]);

  // Handle table change (pagination, sorting)
  const handleTableChange = useCallback((pag, _, sorter) => {
    let newSortBy = "createdAt";
    let newSortOrder = "desc";

    if (sorter && sorter.field) {
      newSortBy = sorter.field;
      newSortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    const newFilters = {
      ...filtersRef.current,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };

    const newPagination = {
      page: pag.current,
      pageSize: pag.pageSize,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
    };

    fetchPostCategories(newFilters, newPagination);
  }, [fetchPostCategories, pagination.totalCount, pagination.totalPages]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      status: "ALL",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setSearchInput("");
    fetchPostCategories(defaultFilters, { page: 1, pageSize: pagination.pageSize });
  }, [fetchPostCategories, pagination.pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchPostCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    postCategories,
    setPostCategories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchPostCategories,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
}
