"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // For demo purposes, we'll use a simple email input
    // In a real app, this would come from authentication
    const email = prompt('กรุณาใส่อีเมลของคุณเพื่อดูคำสั่งซื้อ:');
    if (email) {
      setUserEmail(email);
      fetchOrders(email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (email) => {
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'PENDING_VERIFICATION': return '#fd7e14';
      case 'PENDING': return '#ffc107';
      case 'FAILED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'ชำระเงินแล้ว';
      case 'PENDING_VERIFICATION': return 'รอตรวจสอบการโอนเงิน';
      case 'PENDING': return 'รอชำระเงิน';
      case 'FAILED': return 'ชำระเงินไม่สำเร็จ';
      default: return status;
    }
  };

  if (loading) {
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

  if (!userEmail) {
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
            อีเมล: {userEmail}
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
                    {/* Payment Status */}
                    {order.payment && (
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getPaymentStatusColor(order.payment.status),
                        textAlign: 'center'
                      }}>
                        {getPaymentStatusText(order.payment.status)}
                      </div>
                    )}

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
                        href={`/courses/${order.courseId}`}
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

                    {order.status === 'PENDING_PAYMENT' && (
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
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      📦 ข้อมูลการจัดส่ง
                    </div>
                    <div>ผู้รับ: {order.shipping.recipientName}</div>
                    <div>ที่อยู่: {order.shipping.address}</div>
                    <div>สถานะ: {order.shipping.status}</div>
                    {order.shipping.trackingNumber && (
                      <div>เลขติดตาม: {order.shipping.trackingNumber}</div>
                    )}
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