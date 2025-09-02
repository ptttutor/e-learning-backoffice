"use client";
import { useState } from "react";
import { Button, Card, Typography, Space, message } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import CourseFilters from "@/components/admin/courses/CourseFilters";
import CourseTable from "@/components/admin/courses/CourseTable";
import CourseModal from "@/components/admin/courses/CourseModal";
import DeleteModal from "@/components/admin/courses/DeleteModal";

// Hooks
import { useCourses } from "@/hooks/useCourses";

const { Title, Text } = Typography;

export default function CoursesPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for courses data
  const {
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
  } = useCourses();

  // Create or update course
  const handleSubmitCourse = async (courseData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/courses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(editing ? "แก้ไขคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        fetchCourses();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setCourseToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!courseToDelete?.id) {
      message.error("ไม่พบ ID ของคอร์ส");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseToDelete,
          status: "DELETED",
          deletedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบคอร์สสำเร็จ");
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        await fetchCourses();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบคอร์ส");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: "8px" }} />
            จัดการคอร์สเรียน
          </Title>
          <Text type="secondary">สร้างและจัดการคอร์สเรียนออนไลน์</Text>
        </Space>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
          >
            สร้างคอร์สใหม่
          </Button>
        </div>

        <CourseFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          instructors={instructors}
          categories={categories}
          totalCount={pagination.totalCount}
          currentCount={courses.length}
        />
      </Card>

      <Card>
        <CourseTable
          courses={courses}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <CourseModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitCourse}
        instructors={instructors}
        categories={categories}
        instLoading={instLoading}
        catLoading={catLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        course={courseToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}