"use client";
import { useState } from "react";
import { Button, Card, Typography, Space, Modal, App } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import ExamBankFilters from "./ExamBankFilters";
import ExamTable from "./ExamTable";
import ExamModal from "./ExamModal";
import DeleteModal from "./DeleteModal";
import FileManagementModal from "./FileManagementModal";

// Hooks
import { useExamBank } from "@/hooks/useExamBank";

const { Title, Text } = Typography;

export default function ExamBankManagement() {
  const { message } = App.useApp();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examFiles, setExamFiles] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Use custom hook for exam bank data
  const {
    exams,
    setExams,
    loading,
    categories,
    catLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchExams,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    saveExam,
    deleteExam,
    fetchExamFiles,
    uploadExamFile,
    deleteExamFile,
  } = useExamBank();

  // Toggle isDownload for a file
  const handleToggleDownload = async (fileId, isDownload) => {
    try {
      const response = await fetch(`/api/admin/exam-files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDownload }),
      });
      const result = await response.json();
      if (result.success) {
        setExamFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === fileId ? { ...f, isDownload } : f))
        );
        message.success(
          isDownload ? "เปิดให้ดาวน์โหลดไฟล์นี้" : "ปิดการดาวน์โหลดไฟล์นี้"
        );
      } else {
        message.error(
          result.error || "เกิดข้อผิดพลาดในการอัปเดตสถานะดาวน์โหลด"
        );
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะดาวน์โหลด");
    }
  };

  // Create or update exam with optimistic update
  const handleSubmitExam = async (examData) => {
    setSubmitting(true);
    try {
      const success = await saveExam(examData, editing);
      if (success) {
        setModalOpen(false);
        setEditing(null);
        message.success(editing ? "อัพเดทข้อสอบสำเร็จ" : "สร้างข้อสอบสำเร็จ");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      message.error(
        editing ? "เกิดข้อผิดพลาดในการอัพเดท" : "เกิดข้อผิดพลาดในการสร้างข้อสอบ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setExamToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete with optimistic update
  const confirmDelete = async () => {
    if (!examToDelete?.id) {
      message.error("ไม่พบ ID ของข้อสอบ");
      return;
    }

    setDeleting(true);
    try {
      const success = await deleteExam(examToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setExamToDelete(null);
        message.success("ลบข้อสอบสำเร็จ");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อสอบ");
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  // Handle manage files
  const handleManageFiles = async (record) => {
    setSelectedExam(record);
    try {
      const files = await fetchExamFiles(record.id);
      setExamFiles(files);
      setFileModalOpen(true);
    } catch (error) {
      console.error("Error fetching exam files:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดไฟล์");
    }
  };

  // Handle file upload with optimistic update
  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      if (!selectedExam?.id) {
        onError("ไม่พบข้อมูลข้อสอบ");
        return;
      }

      // Optimistic update - add file to list immediately
      const tempFile = {
        id: `temp-${Date.now()}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploading: true,
      };

      setExamFiles((prevFiles) => [...prevFiles, tempFile]);

      const success = await uploadExamFile(selectedExam.id, file);
      if (success) {
        onSuccess();
        // Replace temp file with real data from server
        const files = await fetchExamFiles(selectedExam.id);
        setExamFiles(files);
        message.success("อัพโหลดไฟล์สำเร็จ");

        // Update exam's file count in exams list
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.id === selectedExam.id
              ? {
                  ...exam,
                  fileCount: files.length,
                  _count: { files: files.length },
                }
              : exam
          )
        );
      } else {
        // Remove temp file on error
        setExamFiles((prevFiles) =>
          prevFiles.filter((f) => f.id !== tempFile.id)
        );
        onError("อัพโหลดไฟล์ไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // Remove temp file on error
      setExamFiles((prevFiles) => prevFiles.filter((f) => f.uploading));
      onError(error.message || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
    }
  };

  // Handle file deletion with optimistic updates
  const handleDeleteFile = async (file) => {
    try {
      setFileToDelete(file);

      // Optimistic update - remove file from UI immediately
      const optimisticFiles = examFiles.filter((f) => f.id !== file.id);
      setExamFiles(optimisticFiles);

      // Perform actual deletion
      const response = await fetch(`/api/admin/exam-files/${file.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      message.success("ลบไฟล์สำเร็จ");
    } catch (error) {
      console.error("Error deleting file:", error);
      // Rollback: restore file to UI
      setExamFiles(examFiles);
      message.error("เกิดข้อผิดพลาดในการลบไฟล์");
    } finally {
      setFileToDelete(null);
    }
  };
  const handleRefreshFiles = async () => {
    if (!selectedExam?.id) return;

    try {
      const files = await fetchExamFiles(selectedExam.id);
      setExamFiles(files);

      // อัพเดทจำนวนไฟล์ใน exam list
      setExams((prevExams) =>
        prevExams.map((exam) =>
          exam.id === selectedExam.id
            ? {
                ...exam,
                fileCount: files.length,
                _count: { files: files.length },
              }
            : exam
        )
      );
    } catch (error) {
      console.error("Error refreshing files:", error);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: "8px" }} />
            คลังข้อสอบ
          </Title>
          <Text type="secondary">จัดการข้อสอบและไฟล์แนบ</Text>
        </Space>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <ExamBankFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
          catLoading={catLoading}
          pagination={pagination}
        />
      </Card>

      {/* Main Content */}
      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มข้อสอบใหม่
          </Button>
        </div>

        <ExamTable
          exams={exams}
          loading={loading}
          pagination={pagination}
          onTableChange={handleTableChange}
          onEdit={(record) => {
            setEditing(record);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onManageFiles={handleManageFiles}
          deleting={deleting}
          deletingId={examToDelete?.id}
        />
      </Card>

      {/* Exam Modal */}
      <ExamModal
        open={modalOpen}
        editing={editing}
        onSubmit={handleSubmitExam}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        categories={categories}
        submitting={submitting}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        exam={examToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* File Management Modal */}
      <FileManagementModal
        open={fileModalOpen}
        exam={selectedExam}
        examFiles={examFiles}
        onCancel={() => {
          setFileModalOpen(false);
          setSelectedExam(null);
          setExamFiles([]);
        }}
        onRefresh={handleRefreshFiles}
        onFileUpload={handleFileUpload}
        onDeleteFile={handleDeleteFile}
        onToggleDownload={handleToggleDownload}
        deletingFileId={fileToDelete?.id}
      />
    </div>
  );
}
