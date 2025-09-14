"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useAntdApp";

export function useCourses() {
  const message = useMessage();
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
    subject: "",
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

  // Use ref to keep track of current state
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Fetch courses with server-side filtering and pagination
  const fetchCourses = useCallback(async (customFilters, customPagination) => {
    setLoading(true);
    try {
      // ใช้ ref เพื่อได้ current state หรือใช้ parameters ที่ส่งมา
      const currentFilters = customFilters || filtersRef.current;
      const currentPagination = customPagination || paginationRef.current;

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPagination.page?.toString() || "1",
        pageSize: currentPagination.pageSize?.toString() || "10",
        search: currentFilters.search || "",
        status: currentFilters.status || "ALL",
        instructorId: currentFilters.instructorId || "",
        categoryId: currentFilters.categoryId || "",
        subject: currentFilters.subject || "",
        sortBy: currentFilters.sortBy || "createdAt",
        sortOrder: currentFilters.sortOrder || "desc",
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
        setPagination(data.pagination || {
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        });
        if (customFilters) {
          setFilters(currentFilters);
        }
      } else {
        message.error(data.error || "โหลดข้อมูลคอร์สไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Fetch courses error:", e);
      message.error("โหลดข้อมูลคอร์สไม่สำเร็จ");
    }
    setLoading(false);
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setCatLoading(false);
  }, []);

  // Fetch instructors
  const fetchInstructors = useCallback(async () => {
    setInstLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=INSTRUCTOR");
      const data = await res.json();
      console.log('data :>> ', data);
      setInstructors(data.data?.users || []);
    } catch (e) {
      message.error("โหลดข้อมูลผู้สอนไม่สำเร็จ");
    }
    setInstLoading(false);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    fetchCourses(newFilters, { page: 1 });
  }, [fetchCourses]);

  // Handle table change (sorting, pagination)
  const handleTableChange = useCallback((paginationInfo, filtersInfo, sorter) => {
    const newFilters = { ...filtersRef.current };
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
  }, [fetchCourses]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFiltersData = {
      search: "",
      status: "ALL",
      instructorId: "",
      categoryId: "",
      subject: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setSearchInput("");
    setFilters(resetFiltersData);
    fetchCourses(resetFiltersData, { page: 1 });
  }, [fetchCourses]);

  // Initial load - แก้ไข dependencies
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchInstructors();
      await fetchCourses();
    };
    loadInitialData();
  }, [fetchCategories, fetchInstructors, fetchCourses]);

  // Debounce search - แก้ไข dependencies
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters = { ...filtersRef.current, search: searchInput };
      fetchCourses(newFilters, { page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, fetchCourses]);

  // Helper functions for optimistic updates
  const updateCourseInList = useCallback((courseId, updatedData) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, ...updatedData }
          : course
      )
    );
  }, []);

  const addCourseToList = useCallback((newCourse) => {
    setCourses(prevCourses => [newCourse, ...prevCourses]);
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1
    }));
  }, []);

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
    updateCourseInList,
    addCourseToList,
  };
}
