"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrderDetails();
  }, [orderId, router]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        setOrderDetails(result.data);
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
        </div>
      </div>
    );
  }

  const isCompleted = orderDetails?.status === 'COMPLETED';
  const isPendingVerification = orderDetails?.status === 'PENDING_VERIFICATION';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '48px 24px'
      }}>
        {/* Success Message */}
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ 
            fontSize: '72px', 
            marginBottom: '24px',
          }}>
            {isCompleted ? '✅' : '⏳'}
          </div>
          
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: isCompleted ? '#28a745' : '#ffc107'
          }}>
            {isCompleted ? 'สำเร็จ!' : 'รอการตรวจสอบ'}
          </h1>
          
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: '18px',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            {isCompleted 
              ? 'ขอบคุณสำหรับการสั่งซื้อ คุณสามารถเข้าถึงเนื้อหาได้แล้ว'
              : 'ขอบคุณสำหรับการสั่งซื้อ เราได้รับหลักฐานการโอนเงินแล้ว กำลังตรวจสอบการชำระเงิน จะแจ้งผลภายใน 1-2 ชั่วโมง'
            }
          </p>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#f8f9fa',
            padding: '16px 24px',
            borderRadius: '8px',
            border: '2px solid #dee2e6',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
              หมายเลขคำสั่งซื้อ
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529' }}>
              #{orderId}
            </div>
          </div>

          {orderDetails && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>รายละเอียดคำสั่งซื้อ</h3>
              <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
                <div><strong>สินค้า:</strong> {orderDetails.course?.title || orderDetails.ebook?.title}</div>
                {orderDetails.ebook?.author && (
                  <div><strong>ผู้เขียน:</strong> {orderDetails.ebook.author}</div>
                )}
                {orderDetails.course?.instructor && (
                  <div><strong>ผู้สอน:</strong> {orderDetails.course.instructor.name}</div>
                )}
                <div><strong>ยอดรวม:</strong> {formatPrice(orderDetails.total)}</div>
                <div><strong>สถานะ:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: isCompleted ? '#d4edda' : '#fff3cd',
                    color: isCompleted ? '#155724' : '#856404'
                  }}>
                    {isCompleted ? 'สำเร็จ' : 'รอการตรวจสอบ'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {isCompleted && orderDetails?.orderType === 'COURSE' && (
              <Link 
                href={`/courses/detail/${orderDetails.courseId}`}
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                🎓 เข้าเรียนเลย
              </Link>
            )}

            {isCompleted && orderDetails?.orderType === 'EBOOK' && (
              <button
                onClick={() => alert('ฟีเจอร์ดาวน์โหลดจะพัฒนาในขั้นตอนถัดไป')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                📥 ดาวน์โหลด
              </button>
            )}
            
            <Link 
              href="/ebooks"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              📚 เลือกซื้อหนังสืออื่น
            </Link>
            
            <Link 
              href="/my-orders"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#007bff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                border: '2px solid #007bff'
              }}
            >
              📋 ดูคำสั่งซื้อของฉัน
            </Link>
          </div>
        </div>

        {/* What's Next */}
        {!isCompleted && (
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              📋 ขั้นตอนถัดไป
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                borderLeft: '4px solid #ffc107'
              }}>
                <div style={{ fontSize: '24px' }}>🏦</div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    ตรวจสอบการโอนเงิน
                  </div>
                  <div style={{ color: '#856404', fontSize: '14px' }}>
                    เรากำลังตรวจสอบหลักฐานการโอนเงินของคุณ ใช้เวลาประมาณ 1-2 ชั่วโมง
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
              }}>
                <div style={{ fontSize: '24px' }}>📧</div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    อีเมลยืนยัน
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '14px' }}>
                    หลังจากยืนยันการชำระเงินแล้ว เราจะส่งอีเมลยืนยันและใบเสร็จให้คุณ
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #007bff'
              }}>
                <div style={{ fontSize: '24px' }}>📱</div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    เข้าถึงเนื้อหา
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '14px' }}>
                    สำหรับ eBook: หลังยืนยันการชำระเงินแล้ว คุณสามารถดาวน์โหลดได้<br/>
                    สำหรับหนังสือกายภาพ: เราจะจัดส่งภายใน 2-3 วันทำการหลังยืนยันการชำระเงิน<br/>
                    สำหรับคอร์ส: คุณสามารถเข้าเรียนได้ทันที
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div style={{
          marginTop: '24px',
          padding: '24px',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', color: '#495057', marginBottom: '8px' }}>
            💬 ต้องการความช่วยเหลือ?
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            ติดต่อเรา: support@example.com | โทร: 02-xxx-xxxx
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>กำลังโหลด...</div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}