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

    // Simulate loading order details
    setTimeout(() => {
      setOrderDetails({
        id: orderId,
        status: 'COMPLETED',
        total: 0,
        createdAt: new Date().toISOString()
      });
      setLoading(false);
    }, 1000);
  }, [orderId, router]);

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
          <div>กำลังประมวลผลคำสั่งซื้อ...</div>
        </div>
      </div>
    );
  }

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
            animation: 'bounce 1s ease-in-out'
          }}>
            ✅
          </div>
          
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: '#28a745'
          }}>
            สั่งซื้อสำเร็จ!
          </h1>
          
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: '18px',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            ขอบคุณสำหรับการสั่งซื้อ เราได้รับคำสั่งซื้อและหลักฐานการโอนเงินของคุณแล้ว<br/>
            กำลังตรวจสอบการชำระเงิน จะแจ้งผลภายใน 1-2 ชั่วโมง
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

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
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
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #ffc107'
            }}>
              <div style={{ fontSize: '24px' }}>🏦</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  ตรวจสอบการโอนเงิน
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
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
                  สำหรับ eBook: หลังยืนยันการชำระเงินแล้ว คุณสามารถดาวน์โหลดได้ในหน้า &quot;คำสั่งซื้อของฉัน&quot;<br/>
                  สำหรับหนังสือกายภาพ: เราจะจัดส่งภายใน 2-3 วันทำการหลังยืนยันการชำระเงิน
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #ffc107'
            }}>
              <div style={{ fontSize: '24px' }}>🎯</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  การสนับสนุน
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  หากมีคำถามเกี่ยวกับคำสั่งซื้อ กรุณาติดต่อทีมสนับสนุนของเรา
                </div>
              </div>
            </div>
          </div>
        </div>

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

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
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