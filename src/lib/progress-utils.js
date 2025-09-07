/**
 * Progress Utility Functions
 * สำหรับจัดการ progress ของคอร์สเรียน
 */

// อัพเดท progress เมื่อดูเนื้อหา
export const updateProgress = async (userId, courseId, contentId) => {
  try {
    const response = await fetch('/api/update-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        courseId,
        contentId
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update progress');
    }

    return result;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

// ดึงข้อมูล progress
export const getProgress = async (userId, courseId) => {
  try {
    const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`);
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get progress');
    }

    return result.data;
  } catch (error) {
    console.error('Error getting progress:', error);
    throw error;
  }
};

// รีเซ็ต progress
export const resetProgress = async (userId, courseId) => {
  try {
    const response = await fetch('/api/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        courseId,
        progress: 0
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to reset progress');
    }

    return result;
  } catch (error) {
    console.error('Error resetting progress:', error);
    throw error;
  }
};

// คำนวณ progress bar width
export const calculateProgressBarWidth = (progress) => {
  return Math.max(0, Math.min(100, progress));
};

// แปลง progress เป็นข้อความ
export const getProgressText = (progress) => {
  if (progress === 0) return 'ยังไม่เริ่มเรียน';
  if (progress < 25) return 'เริ่มต้นแล้ว';
  if (progress < 50) return 'กำลังเรียน';
  if (progress < 75) return 'ใกล้เสร็จแล้ว';
  if (progress < 100) return 'เกือบเสร็จ';
  return 'เรียนจบแล้ว';
};

// แปลง progress เป็นสี
export const getProgressColor = (progress) => {
  if (progress === 0) return 'text-gray-500';
  if (progress < 25) return 'text-blue-500';
  if (progress < 50) return 'text-yellow-500';
  if (progress < 75) return 'text-orange-500';
  if (progress < 100) return 'text-purple-500';
  return 'text-green-500';
};

// React Hook สำหรับจัดการ progress
import { useState, useCallback } from 'react';

export const useProgress = (initialProgress = 0) => {
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProgressHandler = useCallback(async (userId, courseId, contentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProgress(userId, courseId, contentId);
      setProgress(result.progress);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetProgressHandler = useCallback(async (userId, courseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await resetProgress(userId, courseId);
      setProgress(result.progress);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    progress,
    loading,
    error,
    setProgress,
    updateProgress: updateProgressHandler,
    resetProgress: resetProgressHandler,
    progressText: getProgressText(progress),
    progressColor: getProgressColor(progress)
  };
};
