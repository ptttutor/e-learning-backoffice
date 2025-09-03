"use client";
import { useState } from "react";
import { Button, Card, Typography, Space, Modal } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";

// Components
import ExamTable from "@/components/admin/exam-bank/ExamTable";
import ExamModal from "@/components/admin/exam-bank/ExamModal";
import DeleteModal from "@/components/admin/exam-bank/DeleteModal";
import FileManagementModal from "@/components/admin/exam-bank/FileManagementModal";

// Hooks
import { useExams } from "@/hooks/useExams";

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

  // Use custom hook for exams data
  const {
    exams,
    categories,
    loading,
    saveExam,
    deleteExam,
    fetchExamFiles: fetchExamFilesFromHook,
    uploadExamFile,
    deleteExamFile,
  } = useExams();

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
  const handleDelete = (exam) => {
    setExamToDelete(exam);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!examToDelete?.id) return;

    setDeleting(true);
    try {
      const success = await deleteExam(examToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setExamToDelete(null);
      }
    } catch (error) {
      console.error("Delete exam error:", error);
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
    const files = await fetchExamFilesFromHook(exam.id);
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
        const files = await fetchExamFilesFromHook(selectedExam.id);
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
            const files = await fetchExamFilesFromHook(selectedExam.id);
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

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(null)}
            style={{ borderRadius: "6px" }}
            size="middle"
          >
            เพิ่มข้อสอบใหม่
          </Button>
        </div>

        <ExamTable
          exams={exams}
          loading={loading}
          onEdit={openModal}
          onDelete={handleDelete}
          onManageFiles={handleManageFiles}
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
