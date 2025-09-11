"use client";
import { useState, useEffect } from 'react';
import { useMessage } from './useAntdApp';

export const useExams = () => {
  const message = useMessage();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch exams
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/exam-bank");
      const result = await response.json();

      if (result.success) {
        setExams(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/exam-categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data.filter((cat) => cat.isActive));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Create or update exam
  const saveExam = async (examData, editingExam) => {
    try {
      const url = editingExam
        ? `/api/admin/exam-bank/${editingExam.id}`
        : "/api/admin/exam-bank";

      const method = editingExam ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        await fetchExams();
        return true;
      } else {
        message.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      return false;
    }
  };

  // Delete exam
  const deleteExam = async (id) => {
    try {
      const response = await fetch(`/api/admin/exam-bank/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message || "ลบข้อสอบสำเร็จ");
        await fetchExams();
        return true;
      } else {
        message.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      return false;
    }
  };

  // File management functions
  const fetchExamFiles = async (examId) => {
    try {
      const response = await fetch(`/api/admin/exam-files?examId=${examId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        message.error(result.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching exam files:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดไฟล์");
      return [];
    }
  };

  const uploadExamFile = async (file, examId) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", examId);

      const response = await fetch("/api/admin/exam-files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        message.success("อัพโหลดไฟล์สำเร็จ");
        await fetchExams(); // Refresh exams to update file count
        return true;
      } else {
        message.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      return false;
    }
  };

  const deleteExamFile = async (fileId) => {
    try {
      const response = await fetch(`/api/admin/exam-files/${fileId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message || "ลบไฟล์สำเร็จ");
        await fetchExams(); // Refresh exams to update file count
        return true;
      } else {
        message.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error("เกิดข้อผิดพลาดในการลบไฟล์");
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    fetchExams();
    fetchCategories();
  }, []);

  return {
    exams,
    categories,
    loading,
    fetchExams,
    fetchCategories,
    saveExam,
    deleteExam,
    fetchExamFiles,
    uploadExamFile,
    deleteExamFile,
  };
};
