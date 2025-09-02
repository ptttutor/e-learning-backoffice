"use client";
import { useState, useEffect } from "react";
import { message } from "antd";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instLoading, setInstLoading] = useState(false);

  // Server-side filtering and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    instructorId: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
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

  // Fetch courses with server-side filtering and pagination
  const fetchCourses = async (customFilters = {}, customPagination = {}) => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, ...customFilters };
      const currentPagination = { ...pagination, ...customPagination };

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPagination.page.toString(),
        pageSize: currentPagination.pageSize.toString(),
        search: currentFilters.search,
        status: currentFilters.status,
        instructorId: currentFilters.instructorId,
        categoryId: currentFilters.categoryId,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      });

      // Add price filters if they exist
      if (currentFilters.minPrice)
        params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);

      const res = await fetch(`/api/admin/courses?${params}`);
      const data = await res.json();

      if (data.success) {
        setCourses(data.data || []);
        setPagination(data.pagination);
        setFilters(currentFilters);
      } else {
        message.error(data.error || "โหลดข้อมูลคอร์สไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Fetch courses error:", e);
      message.error("โหลดข้อมูลคอร์สไม่สำเร็จ");
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setCatLoading(false);
  };

  // Fetch instructors
  const fetchInstructors = async () => {
    setInstLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=INSTRUCTOR");
      const data = await res.json();
      setInstructors((data.data || []).filter((u) => u.role === "INSTRUCTOR"));
    } catch (e) {
      message.error("โหลดข้อมูลผู้สอนไม่สำเร็จ");
    }
    setInstLoading(false);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    fetchCourses(newFilters, { page: 1 });
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

    fetchCourses(newFilters, newPagination);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
      search: "",
      status: "ALL",
      instructorId: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setSearchInput("");
    setFilters(resetFilters);
    fetchCourses(resetFilters, { page: 1 });
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchInstructors();
      await fetchCourses({}, { page: 1, pageSize: 10 });
    };
    loadInitialData();
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput };
      setFilters(newFilters);
      fetchCourses(newFilters, { page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  return {
    courses,
    loading,
    categories,
    catLoading,
    instructors,
    instLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCourses,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  };
}
