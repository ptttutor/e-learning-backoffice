"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function PurchasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: รายละเอียด, 2: ชำระเงิน, 3: อัพโหลดสลิป

  const itemType = searchParams.get("type"); // 'course' หรือ 'ebook'
  const itemId = searchParams.get("id");

  useEffect(() => {
    if (!isAuthenticated) {
      const redirectUrl = `/purchase?type=${itemType}&id=${itemId}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    if (!itemType || !itemId) {
      setError('ข้อมูลไม่ครบถ้วน');
      setLoading(false);
      return;
    }

    fetchItem();
  }, [itemType, itemId, isAuthenticated, router]);

  // Pre-fill shipping info with user data
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        name: user.name || "",
      }));
    }
  }, [user]);

  const fetchItem = async () => {
    try {
      const endpoint = itemType === 'course' ? `/api/courses/${itemId}` : `/api/ebooks/${itemId}`;
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setItem(result.data);
      } else {
        setError(result.error || 'ไม่พบสินค้าที่ต้องการ');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
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

  const getItemPrice = () => {
    if (itemType === 'course') {
      return item.price || 0;
    } else {
      return item.discountPrice || item.price || 0;
    }
  };

  const getOriginalPrice = () => {
    if (itemType === 'ebook' && item.discountPrice && item.price > item.discountPrice) {
      return item.price;
    }
    return null;
  };

  const getShippingFee = () => {
    return (itemType === 'ebook' && item.isPhysical) ? 50 : 0;
  };

  const getSubtotal = () => {
    return getItemPrice();
  };

  const getCouponDiscount = () => {
    if (couponData) {
      if (couponData.coupon.type === 'FREE_SHIPPING') {
        return getShippingFee();
      }
      return couponData.discount || 0;
    }
    return 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = getShippingFee();
    const discount = getCouponDiscount();
    
    if (couponData && couponData.coupon.type === 'FREE_SHIPPING') {
      return subtotal; // ไม่เอาค่าจัดส่ง
    }
    
    return Math.max(0, subtotal + shipping - discount);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('กรุณากรอกรหัสส่วนลด');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          userId: user.id,
          itemType,
          itemId,
          subtotal: getSubtotal(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCouponData(result.data);
        setCouponError('');
      } else {
        setCouponError(result.error);
        setCouponData(null);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('เกิดข้อผิดพลาดในการตรวจสอบรหัสส่วนลด');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateShippingInfo = () => {
    if (itemType === 'ebook' && item.isPhysical) {
      const required = ['name', 'phone', 'address', 'district', 'province', 'postalCode'];
      for (const field of required) {
        if (!shippingInfo[field].trim()) {
          return false;
        }
      }
    }
    return true;
  };

  const createOrder = async () => {
    if (itemType === 'ebook' && item.isPhysical && !validateShippingInfo()) {
      alert('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
      return;
    }

    setOrderLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          itemType,
          itemId,
          couponCode: couponData ? couponCode : null,
          shippingAddress: (itemType === 'ebook' && item.isPhysical) ? shippingInfo : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.data.isFree) {
          // ฟรี - ไปหน้าสำเร็จ
          router.push(`/order-success?orderId=${result.data.orderId}`);
        } else {
          // เสียเงิน - ไปขั้นตอนชำระเงิน
          setStep(2);
          // เก็บ order data สำหรับขั้นตอนถัดไป
          sessionStorage.setItem('currentOrder', JSON.stringify(result.data));
        }
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setOrderLoading(false);
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#6c757d' }}>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error || !item) {
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
            <Link 
              href={itemType === 'course' ? '/courses' : '/ebooks'}
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
              ← กลับไปหน้ารายการ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getItemPrice();
  const originalPrice = getOriginalPrice();
  const shippingFee = getShippingFee();
  const subtotal = getSubtotal();
  const couponDiscount = getCouponDiscount();
  const total = getTotal();
  const isFree = total === 0;

  // Step 2: Payment Page
  if (step === 2) {
    return <PaymentStep 
      item={item} 
      itemType={itemType} 
      total={total} 
      onBack={() => setStep(1)}
      onNext={() => setStep(3)}
    />;
  }

  // Step 3: Upload Slip
  if (step === 3) {
    return <UploadSlipStep 
      onBack={() => setStep(2)}
    />;
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
            🛒 ขั้นตอนการซื้อ
          </h1>
          <nav style={{ marginTop: '8px', fontSize: '14px', color: '#6c757d' }}>
            <Link 
              href={itemType === 'course' ? '/courses' : '/ebooks'} 
              style={{ color: '#007bff', textDecoration: 'none' }}
            >
              {itemType === 'course' ? 'คอร์สเรียน' : 'หนังสือ'}
            </Link>
            <span style={{ margin: '0 8px' }}>→</span>
            <span>{item.title}</span>
            <span style={{ margin: '0 8px' }}>→</span>
            <span>ขั้นตอนการซื้อ</span>
          </nav>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px'
        }}>
          {/* Product Details */}
          <div>
            {/* Product Info */}
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                📋 รายละเอียดสินค้า
              </h2>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                {/* Product Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {item.coverImageUrl ? (
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>
                      {itemType === 'course' ? '🎓' : '📚'}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {item.title}
                  </h3>
                  
                  {itemType === 'course' && item.instructor && (
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      โดย {item.instructor.name}
                    </p>
                  )}

                  {itemType === 'ebook' && item.author && (
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      โดย {item.author}
                    </p>
                  )}

                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    ประเภท: {itemType === 'course' ? 'คอร์สเรียน' : 'หนังสือ'}
                  </div>

                  {itemType === 'ebook' && item.isPhysical && (
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#389e0d',
                      display: 'inline-block'
                    }}>
                      📦 หนังสือกายภาพ (มีค่าจัดส่ง)
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    รายละเอียด
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#495057',
                    lineHeight: '1.6',
                    fontSize: '16px'
                  }}>
                    {item.description.length > 300 
                      ? `${item.description.substring(0, 300)}...` 
                      : item.description
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            {itemType === 'ebook' && item.isPhysical && (
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  📦 ข้อมูลการจัดส่ง
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      ชื่อผู้รับ *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => handleShippingChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      เบอร์โทรศัพท์ *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px'
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
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px',
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
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px'
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
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px'
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
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Summary */}
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '24px'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                💰 สรุปการสั่งซื้อ
              </h3>

              {/* Coupon Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  🎫 รหัสส่วนลด
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="กรอกรหัสส่วนลด"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: couponLoading ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: couponLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {couponLoading ? '...' : 'ใช้'}
                  </button>
                </div>
                
                {couponError && (
                  <div style={{ 
                    marginTop: '8px', 
                    color: '#dc3545', 
                    fontSize: '14px' 
                  }}>
                    {couponError}
                  </div>
                )}

                {couponData && (
                  <div style={{
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#155724'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{couponData.coupon.name}</strong><br/>
                        <small>{couponData.coupon.discountType}</small>
                      </div>
                      <button
                        onClick={removeCoupon}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span>ราคาสินค้า:</span>
                  <div style={{ textAlign: 'right' }}>
                    {originalPrice && (
                      <div style={{ 
                        textDecoration: 'line-through', 
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                    <span style={{ 
                      color: originalPrice ? '#dc3545' : '#212529',
                      fontWeight: 'bold'
                    }}>
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                </div>
                
                {shippingFee > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span>ค่าจัดส่ง:</span>
                    <span style={{ 
                      textDecoration: (couponData && couponData.coupon.type === 'FREE_SHIPPING') ? 'line-through' : 'none',
                      color: (couponData && couponData.coupon.type === 'FREE_SHIPPING') ? '#6c757d' : '#212529'
                    }}>
                      {formatPrice(shippingFee)}
                    </span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    color: '#28a745'
                  }}>
                    <span>ส่วนลด:</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '2px solid #dee2e6',
                paddingTop: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <span style={{ color: '#28a745' }}>
                    {isFree ? 'ฟรี' : formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={createOrder}
                disabled={orderLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: orderLoading ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: orderLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {orderLoading ? 'กำลังดำเนินการ...' : (isFree ? '🎓 เข้าเรียนฟรี' : '💳 ดำเนินการสั่งซื้อ')}
              </button>

              <Link 
                href={itemType === 'course' ? `/courses/detail/${itemId}` : `/ebooks/${itemId}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#007bff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  textAlign: 'center',
                  border: '2px solid #007bff'
                }}
              >
                ← กลับไปหน้าสินค้า
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({ item, itemType, total, onBack, onNext }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '48px 24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏦</div>
          
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '32px', 
            fontWeight: 'bold'
          }}>
            ชำระเงิน
          </h1>
          
          <p style={{ 
            margin: '0 0 32px 0', 
            fontSize: '18px',
            color: '#6c757d'
          }}>
            กรุณาโอนเงินตามรายละเอียดด้านล่าง
          </p>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#28a745' }}>ข้อมูลบัญชีธนาคาร</h3>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <div><strong>ธนาคาร:</strong> กสิกรไทย</div>
              <div><strong>ชื่อบัญชี:</strong> ฟิสิกส์พี่เต้ย Learning System</div>
              <div><strong>เลขที่บัญชี:</strong> 123-4-56789-0</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#dc3545',
                marginTop: '12px'
              }}>
                <strong>จำนวนเงิน:</strong> {formatPrice(total)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={onBack}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#6c757d',
                border: '2px solid #6c757d',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← กลับ
            </button>
            
            <button
              onClick={onNext}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              โอนเงินแล้ว →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upload Slip Step Component
function UploadSlipStep({ onBack }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadSlip = async () => {
    if (!file) {
      alert('กรุณาเลือกไฟล์หลักฐานการโอนเงิน');
      return;
    }

    const orderData = JSON.parse(sessionStorage.getItem('currentOrder') || '{}');
    if (!orderData.orderId) {
      alert('ไม่พบข้อมูลคำสั่งซื้อ');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('slip', file);
      formData.append('orderId', orderData.orderId);

      const response = await fetch('/api/payments/upload-slip', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.removeItem('currentOrder');
        router.push(`/order-success?orderId=${orderData.orderId}`);
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการอัพโหลด');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '48px 24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              อัพโหลดหลักฐานการโอนเงิน
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '18px',
              color: '#6c757d'
            }}>
              กรุณาอัพโหลดสลิปการโอนเงินเพื่อยืนยันการชำระเงิน
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold' 
            }}>
              เลือกไฟล์หลักฐาน
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed #dee2e6',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#f8f9fa'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              รองรับไฟล์: JPG, PNG, WebP (ขนาดไม่เกิน 5MB)
            </small>
          </div>

          {previewUrl && (
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>ตัวอย่างรูปภาพ:</div>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '400px', 
                  border: '1px solid #dee2e6',
                  borderRadius: '6px'
                }} 
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={onBack}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#6c757d',
                border: '2px solid #6c757d',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← กลับ
            </button>
            
            <button
              onClick={uploadSlip}
              disabled={!file || uploading}
              style={{
                padding: '12px 24px',
                backgroundColor: (!file || uploading) ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดหลักฐาน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}