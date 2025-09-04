"use client";
import { useState } from "react";
import { Button, Card, Typography, Space, message, Modal } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import ExamBankFilters from "@/components/admin/exam-bank/ExamBankFilters";
import ExamTable from "@/components/admin/exam-bank/ExamTable";
import ExamModal from "@/components/admin/exam-bank/ExamModal";
import DeleteModal from "@/components/admin/exam-bank/DeleteModal";
import FileManagementModal from "@/components/admin/exam-bank/FileManagementModal";

// Hooks
import { useExamBank } from "@/hooks/useExamBank";

const { Title, Text } = Typography;

export default function AdminExamBankPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examFiles, setExamFiles] = useState([]);

  // Use custom hook for exam bank data
  const {
    exams,
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

  // Create or update exam
  const handleSubmitExam = async (examData) => {
    try {
      const success = await saveExam(examData, editing);
      if (success) {
        setModalOpen(false);
        setEditing(null);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
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
      const success = await deleteExam(examToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setExamToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
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

  // Handle manage files
  const handleManageFiles = async (exam) => {
    setSelectedExam(exam);
    setFileModalOpen(true);
    // Fetch existing files for this exam
    const files = await fetchExamFiles(exam.id);
    setExamFiles(files);
  };

  // Handle file upload
  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!selectedExam) {
      onError("ไม่พบข้อมูลข้อสอบ");
      return;
    }

    try {
      const success = await uploadExamFile(file, selectedExam.id);
      if (success) {
        onSuccess();
        // Refresh files list
        const files = await fetchExamFiles(selectedExam.id);
        setExamFiles(files);
      } else {
        onError("Upload failed");
      }
    } catch (error) {
      onError(error);
    }
  };

  // Handle file delete
  const handleDeleteFile = async (fileId, fileName) => {
    Modal.confirm({
      title: "ยืนยันการลบไฟล์?",
      content: `คุณต้องการลบไฟล์ "${fileName}" ใช่หรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okType: "danger",
      onOk: async () => {
        try {
          const success = await deleteExamFile(fileId);
          if (success && selectedExam) {
            // Refresh files list
            const files = await fetchExamFiles(selectedExam.id);
            setExamFiles(files);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      },
    });
  };

  // Close file modal
  const closeFileModal = () => {
    setFileModalOpen(false);
    setSelectedExam(null);
    setExamFiles([]);
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
            จัดการคลังข้อสอบ
          </Title>
          <Text type="secondary">จัดการข้อสอบและไฟล์ที่เกี่ยวข้อง</Text>
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
            สร้างข้อสอบใหม่
          </Button>
        </div>

        <ExamBankFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
          totalCount={pagination.totalCount}
          currentCount={exams.length}
          pagination={pagination}
        />
      </Card>

      <Card>
        <ExamTable
          exams={exams}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onManageFiles={handleManageFiles}
          onTableChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ExamModal
        open={modalOpen}
        editing={editing}
        categories={categories}
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

      {/* File Management Modal */}
      <FileManagementModal
        open={fileModalOpen}
        exam={selectedExam}
        examFiles={examFiles}
        onCancel={closeFileModal}
        onFileUpload={handleFileUpload}
        onDeleteFile={handleDeleteFile}
      />
    </div>
  );
}
