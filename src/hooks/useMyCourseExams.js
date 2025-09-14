import { useState, useEffect } from 'react';
import { useMessage } from './useAntdApp';

export const useCourseExams = (courseId, userId) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();

  const fetchExams = async () => {
    if (!courseId || !userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/my-courses/course/${courseId}/exams?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setExams(data.exams);
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error fetching course exams:', error);
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [courseId, userId]);

  return {
    exams,
    loading,
    fetchExams,
  };
};

export const useCourseExamAttempt = (courseId, examId, userId) => {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startExam = async () => {
    if (!courseId || !examId || !userId) return null;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/my-courses/course/${courseId}/exams/${examId}?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setExamData(data.data);
        return data.data;
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาด');
        return null;
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      message.error('เกิดข้อผิดพลาดในการเริ่มข้อสอบ');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (answers) => {
    if (!courseId || !examId || !userId) return null;
    
    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/my-courses/course/${courseId}/exams/${examId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers, userId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success('ส่งคำตอบสำเร็จ');
        return data.result;
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาด');
        return null;
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      message.error('เกิดข้อผิดพลาดในการส่งคำตอบ');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    examData,
    loading,
    submitting,
    startExam,
    submitExam,
  };
};

export const useMyExamResults = (filters = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchResults = async (page = 1) => {
    if (!filters.userId) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/my-courses/exam-results?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.attempts);
        setPagination(data.pagination);
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filters.courseId, filters.status, filters.userId]);

  return {
    results,
    loading,
    pagination,
    fetchResults,
  };
};

export const useMyExamResult = (attemptId, userId) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchResult = async () => {
    if (!attemptId || !userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/my-courses/exam-results/${attemptId}?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        message.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error fetching exam result:', error);
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [attemptId, userId]);

  return {
    result,
    loading,
    fetchResult,
  };
};
