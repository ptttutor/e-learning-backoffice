"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'PENDING_VERIFICATION': return '#17a2b8';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'สำเร็จ';
      case 'PENDING': return 'รอชำระเงิน';
      case 'PENDING_VERIFICATION': return 'รอตรวจสอบ';
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div>กำลังโหลดคำสั่งซื้อ...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🔐</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              จำเป็นต้องเข้าสู่ระบบ
            </h1>
            <p style={{ 
              margin: '0 0 32px 0', 
              fontSize: '18px',
              color: '#6c757d'
            }}>
              กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ
            </p>
            <Link 
              href="/login"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>❌</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              เกิดข้อผิดพลาด
            </h1>
            <p style={{ 
              margin: '0 0 32px 0', 
              fontSize: '18px',
              color: '#6c757d'
            }}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>📋</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              ยังไม่มีคำสั่งซื้อ
            </h1>
            <p style={{ 
              margin: '0 0 32px 0', 
              fontSize: '18px',
              color: '#6c757d'
            }}>
              เริ่มเลือกซื้อหนังสือหรือคอร์สเรียนกันเถอะ!
            </p>
            <Link 
              href="/ebooks"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              📚 เลือกซื้อหนังสือ
            </Link>
          </div>
        </div>
      </div>
    );
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
          padding: '0 24px'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: '#212529'
          }}>
            📋 คำสั่งซื้อของฉัน
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6c757d',
            fontSize: '16px'
          }}>
            อีเมล: {user?.email}
          </p>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Order Header */}
              <div style={{
                padding: '20px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                    คำสั่งซื้อ #{order.id.slice(-8)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    สั่งซื้อเมื่อ: {formatDate(order.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status)
                  }}>
                    {getStatusText(order.status)}
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    marginTop: '8px'
                  }}>
                    {formatPrice(order.total)}
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* Item Image */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {(order.ebook?.coverImageUrl || order.course?.coverImageUrl) ? (
                      <img 
                        src={order.ebook?.coverImageUrl || order.course?.coverImageUrl} 
                        alt={order.ebook?.title || order.course?.title}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '24px' }}>
                        {order.orderType === 'EBOOK' ? '📚' : '🎓'}
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {order.ebook?.title || order.course?.title}
                    </h3>
                    
                    {order.ebook?.author && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        โดย {order.ebook.author}
                      </p>
                    )}

                    {order.course?.instructor && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        โดย {order.course.instructor.name}
                      </p>
                    )}

                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      ประเภท: {order.orderType === 'EBOOK' ? 'หนังสือ' : 'คอร์สเรียน'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.status === 'COMPLETED' && order.orderType === 'EBOOK' && (
                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        onClick={() => alert('ฟีเจอร์ดาวน์โหลดจะพัฒนาในขั้นตอนถัดไป')}
                      >
                        📥 ดาวน์โหลด
                      </button>
                    )}
                    
                    {order.status === 'COMPLETED' && order.orderType === 'COURSE' && (
                      <Link
                        href={`/courses/detail/${order.courseId}`}
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}
                      >
                        🎓 เข้าเรียน
                      </Link>
                    )}

                    {order.payment?.ref && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        textAlign: 'center'
                      }}>
                        Ref: {order.payment.ref}
                      </div>
                    )}

                    {order.status === 'PENDING_VERIFICATION' && (
                      <div style={{
                        padding: '8px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#856404',
                        textAlign: 'center'
                      }}>
                        ⏳ รอตรวจสอบการโอนเงิน
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                {order.shipping && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        📦 ข้อมูลการจัดส่ง
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#ffc107'
                      }}>
                        {order.shipping.status === 'PENDING' ? 'รอดำเนินการ' : order.shipping.status}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6c757d' }}>ผู้รับ:</span>
                        <span style={{ fontWeight: '500' }}>{order.shipping.recipientName}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6c757d' }}>เบอร์โทร:</span>
                        <span style={{ fontWeight: '500' }}>{order.shipping.recipientPhone}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6c757d', marginTop: '2px' }}>ที่อยู่:</span>
                        <span style={{ 
                          fontWeight: '500', 
                          textAlign: 'right', 
                          maxWidth: '60%',
                          lineHeight: '1.4'
                        }}>
                          {order.shipping.address}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}