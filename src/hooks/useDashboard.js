import { useState, useEffect } from 'react';

// Utility function to calculate dashboard statistics from orders
const calculateOrderStats = (orders) => {
  if (!orders || orders.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      courseRevenue: 0,
      ebookRevenue: 0,
      coursesSold: 0,
      ebooksSold: 0,
      uniqueCoursesCount: 0,
      uniqueEbooksCount: 0,
    };
  }

  // For course orders: use order.status === 'COMPLETED'
  // For ebook orders: use payment.status === 'COMPLETED' (because order status might be PENDING)
  const completedCourseOrders = orders.filter(order => 
    order.orderType === 'COURSE' && order.status === 'COMPLETED'
  );
  
  const completedEbookOrders = orders.filter(order => 
    order.orderType === 'EBOOK' && order.payment?.status === 'COMPLETED'
  );
  
  // All orders with payment completed (for revenue calculation)
  const paidOrders = [
    ...completedCourseOrders,
    ...completedEbookOrders
  ];
  
  // Count pending orders
  const pendingCourseOrders = orders.filter(order => 
    order.orderType === 'COURSE' && order.status === 'PENDING'
  );
  
  const pendingEbookOrders = orders.filter(order => 
    order.orderType === 'EBOOK' && order.payment?.status !== 'COMPLETED'
  );
  
  // รายได้รวม: Course ใช้ order.total, E-book ใช้ order.payment.amount
  const courseRevenue = completedCourseOrders.reduce((sum, order) => sum + order.total, 0);
  const ebookRevenue = completedEbookOrders.reduce((sum, order) => sum + (order.payment?.amount || 0), 0);
  const totalRevenue = courseRevenue + ebookRevenue;
  
  const uniqueCourses = new Set(completedCourseOrders.map(order => order.courseId).filter(Boolean));
  const uniqueEbooks = new Set(completedEbookOrders.map(order => order.ebookId).filter(Boolean));

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: paidOrders.length,
    pendingOrders: pendingCourseOrders.length + pendingEbookOrders.length,
    courseRevenue,
    ebookRevenue,
    coursesSold: completedCourseOrders.length,
    ebooksSold: completedEbookOrders.length,
    uniqueCoursesCount: uniqueCourses.size,
    uniqueEbooksCount: uniqueEbooks.size,
  };
};

export function useDashboardStats(period = 30) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders for calculation
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
  // ป้องกันกรณี orders เป็น null/undefined
  const orders = Array.isArray(data.data) ? data.data : [];
  const orderStats = calculateOrderStats(orders);
      
      // Format the data to match the component's expected structure
      const formattedStats = {
        stats: {
          revenue: {
            total: orderStats.totalRevenue,
            course: orderStats.courseRevenue,
            ebook: orderStats.ebookRevenue,
          },
          orders: {
            total: orderStats.totalOrders,
            completed: orderStats.completedOrders,
            pending: orderStats.pendingOrders,
          },
          courses: {
            sold: orderStats.coursesSold,
            unique: orderStats.uniqueCoursesCount,
          },
          ebooks: {
            sold: orderStats.ebooksSold,
            unique: orderStats.uniqueEbooksCount,
          },
          users: {
            new: 0,
            total: 0,
          },
          enrollments: {
            total: orderStats.coursesSold,
            active: orderStats.coursesSold,
          }
        }
      };
      
      setStats(formattedStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useCourseSales(period = 30) {
  const [courseSales, setCourseSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      // Filter only completed course orders
      const courseOrders = data.data.filter(order => 
        order.orderType === 'COURSE' && order.status === 'COMPLETED'
      );
      
      const totalRevenue = courseOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = courseOrders.length;
      const uniqueCourses = new Set(courseOrders.map(order => order.courseId).filter(Boolean));
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const formattedData = {
        summary: {
          totalRevenue,
          totalOrders,
          totalCourses: uniqueCourses.size,
          averageOrderValue,
        },
        orders: courseOrders,
      };
      
      setCourseSales(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseSales();
  }, [period]);

  return {
    courseSales,
    loading,
    error,
    refetch: fetchCourseSales
  };
}

export function useEbookSales(period = 30) {
  const [ebookSales, setEbookSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEbookSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      // Filter ebook orders with completed payment
      const ebookOrders = data.data.filter(order => 
        order.orderType === 'EBOOK' && order.payment?.status === 'COMPLETED'
      );
      
      const totalRevenue = ebookOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = ebookOrders.length;
      const uniqueEbooks = new Set(ebookOrders.map(order => order.ebookId).filter(Boolean));
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const formattedData = {
        summary: {
          totalRevenue,
          totalOrders,
          totalEbooks: uniqueEbooks.size,
          averageOrderValue,
        },
        orders: ebookOrders,
      };
      
      setEbookSales(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbookSales();
  }, [period]);

  return {
    ebookSales,
    loading,
    error,
    refetch: fetchEbookSales
  };
}

export function useRevenueAnalytics(period = 12) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/dashboard/revenue-analytics?period=${period}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch revenue analytics');
      }
      
      setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
