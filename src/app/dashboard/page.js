"use client";
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    totalCourses: 0,
    totalEbooks: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserStats();
      fetchRecentOrders();
    }
  }, [user, authLoading, router]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/stats?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}&limit=5`);
      const result = await response.json();
      
      if (result.success) {
        setRecentOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'PENDING_PAYMENT': return '#fd7e14';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'สำเร็จ';
      case 'PENDING': return 'รอดำเนินการ';
      case 'PENDING_PAYMENT': return 'รอตรวจสอบการชำระเงิน';
      case 'CANCELLED': return 'ยกเลิก';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#6c757d' }}>กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dee2e6',
        padding: '24px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#212529'
            }}>
              👋 สวัสดี, {user.name}
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6c757d',
              fontSize: '16px'
            }}>
              ยินดีต้อนรับสู่แดชบอร์ดส่วนตัว
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              href="/"
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              🏠 หน้าหลัก
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🚪 ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 24px'
      }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats.totalOrders}
            </div>
            <div style={{ color: '#6c757d' }}>คำสั่งซื้อทั้งหมด</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.completedOrders}
            </div>
            <div style={{ color: '#6c757d' }}>คำสั่งซื้อสำเร็จ</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {formatPrice(stats.totalSpent)}
            </div>
            <div style={{ color: '#6c757d' }}>ยอดซื้อรวม</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
              {stats.totalCourses + stats.totalEbooks}
            </div>
            <div style={{ color: '#6c757d' }}>สินค้าที่ซื้อ</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            🚀 เมนูด่วน
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <Link 
              href="/my-courses"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#495057',
                textAlign: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎓</div>
              <div style={{ fontWeight: '500' }}>คอร์สเรียนของฉัน</div>
            </Link>

            <Link 
              href="/my-orders"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#495057',
                textAlign: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontWeight: '500' }}>ประวัติคำสั่งซื้อ</div>
            </Link>

            <Link 
              href="/cart"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#495057',
                textAlign: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
              <div style={{ fontWeight: '500' }}>ตะกร้าสินค้า</div>
            </Link>

            <Link 
              href="/profile"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#495057',
                textAlign: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
              <div style={{ fontWeight: '500' }}>ข้อมูลส่วนตัว</div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            📋 คำสั่งซื้อล่าสุด
          </h2>

          {recentOrders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 0',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div>ยังไม่มีคำสั่งซื้อ</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((order) => (
                <div key={order.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {order.ebook?.title || order.course?.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {formatDate(order.createdAt)} • {formatPrice(order.total)}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status)
                  }}>
                    {getStatusText(order.status)}
                  </div>
                </div>
              ))}
              
              <Link 
                href="/my-orders"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                ดูคำสั่งซื้อทั้งหมด →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}