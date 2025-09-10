"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Typography,
  Space,
  message,
  Breadcrumb,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

// Components
import ExamTable from "@/components/admin/course-exams/ExamTable";
import ExamModal from "@/components/admin/course-exams/ExamModal";
import DeleteModal from "@/components/admin/course-exams/DeleteModal";
import ExamFilters from "@/components/admin/course-exams/ExamFilters";

// Hooks
import { useCourseExams } from "@/hooks/useCourseExams";

const { Title, Text } = Typography;

export default function CourseExamsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Course info state
  const [courseInfo, setCourseInfo] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);

  // Use custom hook for exams data
  const {
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
  } = useCourseExams(courseId);

  // Fetch course info
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`);
        const data = await response.json();
        if (data.success) {
          setCourseInfo(data.data);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลคอร์สได้");
        }
      } catch (error) {
        console.error("Error fetching course info:", error);
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลคอร์ส");
      } finally {
        setCourseLoading(false);
      }
    };

    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  // Create or update exam
  const handleSubmitExam = async (examData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/course-exams/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...examData, courseId }),
        });
      } else {
        res = await fetch(`/api/admin/course-exams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...examData, courseId }),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(
          editing ? "แก้ไขข้อสอบสำเร็จ" : "สร้างข้อสอบสำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        fetchExams();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setExamToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!examToDelete?.id) {
      message.error("ไม่พบ ID ของข้อสอบ");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/course-exams/${examToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบข้อสอบสำเร็จ");
        setDeleteModalOpen(false);
        setExamToDelete(null);
        await fetchExams();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบข้อสอบ");
      }
    } catch (error) {
      console.error("Delete exam error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
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

  // Handle manage questions
  const handleManageQuestions = (exam) => {
    router.push(`/admin/courses/exams/questions/${exam.id}`);
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header Card */}
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Breadcrumb
            items={[
              {
                href: "/admin/dashboard",
                title: (
                  <Space>
                    <HomeOutlined />
                    <span>หน้าหลัก</span>
                  </Space>
                ),
              },
              {
                href: "/admin/courses",
                title: (
                  <Space>
                    <BookOutlined />
                    <span>จัดการคอร์ส</span>
                  </Space>
                ),
              },
              {
                title: (
                  <Space>
                    <FileTextOutlined />
                    <span>จัดการข้อสอบ</span>
                  </Space>
                ),
              },
            ]}
          />
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                จัดการข้อสอบ
              </Title>
              {courseInfo && !courseLoading && (
                <Text type="secondary">
                  คอร์ส: {courseInfo.title}
                </Text>
              )}
            </Space>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                กลับ
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
              >
                เพิ่มข้อสอบใหม่
              </Button>
            </Space>
          </Space>
        </Space>
      </Card>

      {/* Filters Card */}
      <Card style={{ marginBottom: "24px" }}>
        <ExamFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          loading={loading}
          currentCount={exams.length}
        />
      </Card>

      {/* Exams Table */}
      <Card>
        <ExamTable
          exams={exams}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onManageQuestions={handleManageQuestions}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ExamModal
        open={modalOpen}
        editing={editing}
        courseId={courseId}
        onCancel={closeModal}
        onSubmit={handleSubmitExam}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        exam={examToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
