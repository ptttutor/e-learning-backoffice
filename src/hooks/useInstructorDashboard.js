import { useState, useEffect } from 'react';

export const useInstructorDashboardStats = (instructorId, period = 30) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!instructorId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/instructor/dashboard/stats?instructorId=${instructorId}&period=${period}`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [instructorId, period]);

  return { stats, loading, error };
};

export const useInstructorCourseSales = (instructorId, period = 30) => {
  const [courseSales, setCourseSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!instructorId) {
      setLoading(false);
      return;
    }

    const fetchCourseSales = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/instructor/dashboard/course-sales?instructorId=${instructorId}&period=${period}`);
        const data = await response.json();
        
        if (data.success) {
          setCourseSales(data.data);
        } else {
          setError(data.error || 'Failed to fetch course sales');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseSales();
  }, [instructorId, period]);

  return { courseSales, loading, error };
};
