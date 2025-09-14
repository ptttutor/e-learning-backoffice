"use client";
import { useState } from 'react';
import { Button, Card, Typography, Space, Spin, Modal } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import { useMessage } from "@/hooks/useAntdApp";

// Components
import EbookFilters from "./EbookFilters";
import EbookTable from "./EbookTable";
import EbookModal from "./EbookModal";
import DeleteModal from "./DeleteModal";
import EbookFileManagementModal from "./EbookFileManagementModal";

// Hooks
import { useEbooks } from "@/hooks/useEbooks";

const { Title, Text } = Typography;

export default function EbooksManagement() {
  const message = useMessage();
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // File management states
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [ebookFiles, setEbookFiles] = useState([]);
  const [fileDeleteModalOpen, setFileDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deletingFile, setDeletingFile] = useState(false);

  // Loading states for different operations
  const [submitting, setSubmitting] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [ebookId]: { editing, deleting, managingFiles } }

  // Use custom hook for ebooks data
  const {
    ebooks,
    setEbooks,
    categories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    submitEbook,
    deleteEbook,
    fetchEbookFile,
    uploadEbookFile,
    deleteEbookFile,
  } = useEbooks();

  // Optimistic update functions
  const updateEbookInList = (ebookId, updatedData) => {
    setEbooks(prev => prev.map(ebook => 
      ebook.id === ebookId ? { ...ebook, ...updatedData } : ebook
    ));
  };

  const addEbookToList = (newEbook) => {
    setEbooks(prev => [newEbook, ...prev]);
  };

  const removeEbookFromList = (ebookId) => {
    setEbooks(prev => prev.filter(ebook => ebook.id !== ebookId));
  };

  // Handle submit ebook with optimistic updates
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // For edit operations, optimistically update the UI first
      if (editingEbook) {
        updateEbookInList(editingEbook.id, values);
      }

      const result = await submitEbook(values, editingEbook);
      
      if (result.success) {
        message.success(
          editingEbook ? "แก้ไข eBook สำเร็จ" : "สร้าง eBook สำเร็จ"
        );
        setModalVisible(false);
        setEditingEbook(null);
        
        // For create operations, add to list
        if (!editingEbook && result.data) {
          addEbookToList(result.data);
        } else if (editingEbook && result.data) {
          // Update with server response data
          updateEbookInList(editingEbook.id, result.data);
        }
      } else {
        message.error(result.error || "เกิดข้อผิดพลาด");
        // Revert optimistic update on error
        if (editingEbook) {
          // Could fetch fresh data here, but typically the original values are still valid
        }
      }
    } catch (error) {
      console.error("Error saving ebook:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      // On error, could revert optimistic update
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal for create/edit
  const openModal = (ebook = null) => {
    if (ebook) {
      setActionLoading(prev => ({
        ...prev,
        [ebook.id]: { ...prev[ebook.id], editing: true }
      }));
    }
    setEditingEbook(ebook);
    setModalVisible(true);
    if (ebook) {
      // Clear loading state after modal opens
      setTimeout(() => {
        setActionLoading(prev => ({
          ...prev,
          [ebook.id]: { ...prev[ebook.id], editing: false }
        }));
      }, 100);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingEbook(null);
  };

  // Handle delete
  const handleDelete = (ebook) => {
    setActionLoading(prev => ({
      ...prev,
      [ebook.id]: { ...prev[ebook.id], deleting: true }
    }));
    setEbookToDelete(ebook);
    setDeleteModalOpen(true);
    // Clear loading state after modal opens
    setTimeout(() => {
      setActionLoading(prev => ({
        ...prev,
        [ebook.id]: { ...prev[ebook.id], deleting: false }
      }));
    }, 100);
  };

  // Confirm delete with optimistic updates
  const confirmDelete = async () => {
    if (!ebookToDelete?.id) {
      return;
    }

    setDeleting(true);
    
    // Optimistically remove from list
    removeEbookFromList(ebookToDelete.id);
    
    try {
      const success = await deleteEbook(ebookToDelete.id);
      
      if (success) {
        message.success("ลบ eBook สำเร็จ");
        setDeleteModalOpen(false);
        setEbookToDelete(null);
      } else {
        message.error("เกิดข้อผิดพลาดในการลบ");
        // Revert optimistic update by re-adding the item
        addEbookToList(ebookToDelete);
      }
    } catch (error) {
      console.error("Error deleting ebook:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      // Revert optimistic update by re-adding the item
      addEbookToList(ebookToDelete);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEbookToDelete(null);
  };

  // Handle manage files
  const handleManageFiles = async (ebook) => {
    console.log('handleManageFiles called with ebook:', ebook);
    setActionLoading(prev => ({
      ...prev,
      [ebook.id]: { ...prev[ebook.id], managingFiles: true }
    }));
    setSelectedEbook(ebook);
    setFileModalOpen(true);
    setLoadingFiles(true);
    try {
      // Fetch existing file for this ebook
      const files = await fetchEbookFile(ebook.id);
      console.log('Fetched files:', files);
      setEbookFiles(files);
    } finally {
      setLoadingFiles(false);
      setActionLoading(prev => ({
        ...prev,
        [ebook.id]: { ...prev[ebook.id], managingFiles: false }
      }));
    }
  };

  // Handle file upload with improved UX
  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!selectedEbook) {
      onError("ไม่พบข้อมูล eBook");
      return;
    }

    setUploadingFile(true);
    try {
      const result = await uploadEbookFile(selectedEbook.id, file);
      
      if (result && !result.error) {
        onSuccess();
        message.success("อัพโหลดไฟล์สำเร็จ");
        
        // Refresh files list only (not entire page)
        setLoadingFiles(true);
        const files = await fetchEbookFile(selectedEbook.id);
        setEbookFiles(files);
      } else {
        onError(result?.error || "Upload failed");
        message.error(result?.error || "อัพโหลดไฟล์ไม่สำเร็จ");
      }
    } catch (error) {
      onError(error);
      message.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploadingFile(false);
      setLoadingFiles(false);
    }
  };

  // Handle file delete
  const handleDeleteFile = async (ebookId, fileName) => {
    // เปิด modal ยืนยันการลบ
    setFileToDelete({ id: ebookId, name: fileName });
    setFileDeleteModalOpen(true);
  };

  // ยืนยันการลบไฟล์
  const confirmDeleteFile = async () => {
    if (!fileToDelete?.id) {
      message.error("ไม่พบไฟล์ที่จะลบ");
      return;
    }

    setDeletingFile(true);
    try {
      const success = await deleteEbookFile(fileToDelete.id);
      if (success) {
        message.success("ลบไฟล์สำเร็จ");
        setFileDeleteModalOpen(false);
        setFileToDelete(null);
        
        // Refresh files list only (not entire page)
        if (selectedEbook) {
          setLoadingFiles(true);
          const files = await fetchEbookFile(selectedEbook.id);
          setEbookFiles(files);
          setLoadingFiles(false);
        }
      } else {
        message.error("เกิดข้อผิดพลาดในการลบไฟล์");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error("เกิดข้อผิดพลาดในการลบไฟล์");
    } finally {
      setDeletingFile(false);
    }
  };

  // ยกเลิกการลบไฟล์
  const cancelDeleteFile = () => {
    setFileDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // Close file modal
  const closeFileModal = () => {
    setFileModalOpen(false);
    setSelectedEbook(null);
    setEbookFiles([]);
    setLoadingFiles(false);
    setUploadingFile(false);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

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
            จัดการ eBooks
          </Title>
          <Text type="secondary">จัดการหนังสืออิเล็กทรอนิกส์และเนื้อหา</Text>
        </Space>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ borderRadius: "6px" }}
            size="middle"
            disabled={submitting || deleting}
          >
            เพิ่ม eBook ใหม่
          </Button>
        </div>

        <EbookFilters
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
          totalCount={pagination.totalCount}
          currentCount={ebooks.length}
        />
      </Card>

      <Card>
        <EbookTable
          ebooks={ebooks}
          categories={categories}
          loading={loading}
          filters={filters}
          pagination={pagination}
          onEdit={openModal}
          onDelete={handleDelete}
          onManageFiles={handleManageFiles}
          onTableChange={handleTableChange}
          actionLoading={actionLoading}
        />
      </Card>

      {/* Create/Edit Modal */}
      <EbookModal
        open={modalVisible}
        editing={editingEbook}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        categories={categories}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        ebook={ebookToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* File Management Modal */}
      <EbookFileManagementModal
        open={fileModalOpen}
        ebook={selectedEbook}
        ebookFile={ebookFiles}
        onCancel={closeFileModal}
        onFileUpload={handleFileUpload}
        onDeleteFile={handleDeleteFile}
        loadingFiles={loadingFiles}
        uploadingFile={uploadingFile}
      />

      {/* File Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบไฟล์"
        open={fileDeleteModalOpen}
        onOk={confirmDeleteFile}
        onCancel={cancelDeleteFile}
        okText="ลบ"
        cancelText="ยกเลิก"
        okType="danger"
        confirmLoading={deletingFile}
        centered
      >
        <p>คุณต้องการลบไฟล์ &quot;{fileToDelete?.name}&quot; ใช่หรือไม่?</p>
        <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </Modal>
    </div>
  );
}