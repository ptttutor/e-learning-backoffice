"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    recipientPhone: '',
    address: '',
    district: '',
    province: '',
    postalCode: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [user, params.orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderId}`);
      const data = await res.json();
      
      if (data.success) {
        setOrder(data.data);
        // Pre-fill shipping info if exists
        if (data.data.shipping) {
          setShippingInfo({
            recipientName: data.data.shipping.recipientName || user?.name || '',
            recipientPhone: data.data.shipping.recipientPhone || '',
            address: data.data.shipping.address || '',
            district: data.data.shipping.district || '',
            province: data.data.shipping.province || '',
            postalCode: data.data.shipping.postalCode || ''
          });
        } else if (user) {
          setShippingInfo(prev => ({
            ...prev,
            recipientName: user.name || ''
          }));
        }
      } else {
        alert('ไม่พบคำสั่งซื้อ');
        router.push('/my-orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateShippingInfo = async () => {
    if (!order.shipping) return true;

    try {
      const res = await fetch(`/api/admin/shipping/${order.shipping.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingInfo),
      });

      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('Error updating shipping:', error);
      return false;
    }
  };

  const handleUploadSlip = async () => {
    if (!selectedFile) {
      alert('กรุณาเลือกไฟล์หลักฐานการชำระเงิน');
      return;
    }

    // Validate shipping info for physical books
    if (order.ebook?.isPhysical) {
      const requiredFields = ['recipientName', 'recipientPhone', 'address', 'district', 'province', 'postalCode'];
      const missingFields = requiredFields.filter(field => !shippingInfo[field].trim());
      
      if (missingFields.length > 0) {
        alert('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
        return;
      }
    }

    setUploading(true);
    try {
      // Update shipping info first if needed
      if (order.ebook?.isPhysical) {
        const shippingUpdated = await updateShippingInfo();
        if (!shippingUpdated) {
          alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูลการจัดส่ง');
          setUploading(false);
          return;
        }
      }

      // Upload payment slip
      const formData = new FormData();
      formData.append('slip', selectedFile);
      formData.append('orderId', order.id);
      formData.append('paymentId', order.payment?.id);

      const res = await fetch('/api/payments/upload-slip', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        alert('อัพโหลดหลักฐานการชำระเงินสำเร็จ กำลังรอการตรวจสอบ');
        router.push(`/order-success?orderId=${order.id}`);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการอัพโหลด');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
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
        justifyContent: 'center' 
      }}>
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>ไม่พบคำสั่งซื้อ</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold' }}>
            ชำระเงิน
          </h1>
          <div style={{ color: '#6c757d' }}>
            หมายเลขคำสั่งซื้อ: #{order.id}
          </div>
        </div>

        {/* Order Details */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>รายละเอียดคำสั่งซื้อ</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>สินค้า:</strong> {order.course?.title || order.ebook?.title}
          </div>
          
          {order.ebook?.author && (
            <div style={{ marginBottom: '16px' }}>
              <strong>ผู้เขียน:</strong> {order.ebook.author}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <strong>ประเภท:</strong> {order.orderType === 'COURSE' ? 'คอร์สเรียน' : 'หนังสือ'}
            {order.ebook?.isPhysical && (
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 6px',
                backgroundColor: '#17a2b8',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                หนังสือกายภาพ
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>ราคาสินค้า:</strong> {formatPrice((order.total || 0) - (order.shippingFee || 0))}
          </div>
          
          {order.shippingFee > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <strong>ค่าจัดส่ง:</strong> {formatPrice(order.shippingFee)}
            </div>
          )}
          
          <div style={{ 
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            borderLeft: '4px solid #007bff'
          }}>
            <strong>ยอดรวมทั้งสิ้น:</strong> 
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff', marginLeft: '8px' }}>
              {formatPrice(order.total)}
            </span>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>สถานะ:</strong> 
            <span style={{ 
              marginLeft: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: order.status === 'PENDING' ? '#ffc107' : 
                             order.status === 'PENDING_VERIFICATION' ? '#17a2b8' : '#28a745',
              color: 'white',
              fontSize: '12px'
            }}>
              {order.status === 'PENDING' ? 'รอการชำระเงิน' : 
               order.status === 'PENDING_VERIFICATION' ? 'รอการตรวจสอบ' : 
               order.status === 'COMPLETED' ? 'สำเร็จ' :
               order.status}
            </span>
          </div>
        </div>

        {/* Shipping Info for Physical Books */}
        {order.ebook?.isPhysical && order.status === 'PENDING' && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>ข้อมูลการจัดส่ง</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  ชื่อผู้รับ *
                </label>
                <input
                  type="text"
                  value={shippingInfo.recipientName}
                  onChange={(e) => handleShippingChange('recipientName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  value={shippingInfo.recipientPhone}
                  onChange={(e) => handleShippingChange('recipientPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                ที่อยู่ *
              </label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => handleShippingChange('address', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  เขต/อำเภอ *
                </label>
                <input
                  type="text"
                  value={shippingInfo.district}
                  onChange={(e) => handleShippingChange('district', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  จังหวัด *
                </label>
                <input
                  type="text"
                  value={shippingInfo.province}
                  onChange={(e) => handleShippingChange('province', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  รหัสไปรษณีย์ *
                </label>
                <input
                  type="text"
                  value={shippingInfo.postalCode}
                  onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Info */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>ข้อมูลการโอนเงิน</h2>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>ธนาคาร:</strong> ธนาคารกสิกรไทย
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>เลขที่บัญชี:</strong> 123-4-56789-0
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>ชื่อบัญชี:</strong> บริษัท อีเลิร์นนิ่ง จำกัด
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>จำนวนเงิน:</strong> {formatPrice(order.total)}
            </div>
          </div>
        </div>

        {/* Upload Slip */}
        {order.status === 'PENDING' && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>อัพโหลดหลักฐานการชำระเงิน</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                รองรับไฟล์: JPG, PNG, WebP (ขนาดไม่เกิน 5MB)
              </div>
            </div>

            {previewUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>ตัวอย่างรูปภาพ:</div>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '400px', 
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
            )}

            <button
              onClick={handleUploadSlip}
              disabled={!selectedFile || uploading}
              style={{
                backgroundColor: selectedFile && !uploading ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                width: '100%'
              }}
            >
              {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดหลักฐานการชำระเงิน'}
            </button>
          </div>
        )}

        {/* Status Info */}
        {order.status === 'PENDING_VERIFICATION' && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              📋 สถานะ: รอการตรวจสอบ
            </div>
            <div>
              เราได้รับหลักฐานการชำระเงินของคุณแล้ว กำลังตรวจสอบการชำระเงิน 
              จะแจ้งผลภายใน 1-2 ชั่วโมง
            </div>
          </div>
        )}
      </div>
    </div>
  );
}