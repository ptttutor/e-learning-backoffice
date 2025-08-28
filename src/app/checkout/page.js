"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Billing Address
    address: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Payment Method
    paymentMethod: 'bank_transfer',
    
    // Bank Transfer Info
    transferSlip: null,
    transferDate: '',
    transferTime: '',
    transferAmount: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone'];
    
    for (const field of required) {
      if (!formData[field].trim()) {
        setError(`กรุณากรอก${getFieldLabel(field)}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)');
      return false;
    }

    // Bank transfer validation
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.transferSlip) {
        setError('กรุณาอัพโหลดสลิปการโอนเงิน');
        return false;
      }
      if (!formData.transferDate) {
        setError('กรุณาระบุวันที่โอนเงิน');
        return false;
      }
      if (!formData.transferTime) {
        setError('กรุณาระบุเวลาที่โอนเงิน');
        return false;
      }
      if (!formData.transferAmount || parseFloat(formData.transferAmount) <= 0) {
        setError('กรุณาระบุจำนวนเงินที่โอน');
        return false;
      }
      
      // Check if transfer amount matches total (with some tolerance)
      const transferAmount = parseFloat(formData.transferAmount);
      const cartTotal = getCartTotal();
      if (Math.abs(transferAmount - cartTotal) > 1) {
        setError(`จำนวนเงินที่โอนไม่ตรงกับยอดรวม (${formatPrice(cartTotal)})`);
        return false;
      }
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      firstName: 'ชื่อ',
      lastName: 'นามสกุล',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์'
    };
    return labels[field] || field;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        billingAddress: {
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode
        },
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          price: item.discountPrice || item.price,
          quantity: item.quantity
        })),
        paymentMethod: formData.paymentMethod,
        total: getCartTotal()
      };

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart and redirect to success page
        clearCart();
        router.push(`/order-success?orderId=${result.orderId}`);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
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
            💳 ชำระเงิน
          </h1>
          <nav style={{ marginTop: '8px', fontSize: '14px', color: '#6c757d' }}>
            <Link href="/cart" style={{ color: '#007bff', textDecoration: 'none' }}>
              ตะกร้าสินค้า
            </Link>
            <span style={{ margin: '0 8px' }}>→</span>
            <span>ชำระเงิน</span>
          </nav>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '24px'
          }}>
            {/* Checkout Form */}
            <div>
              {/* Customer Information */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  👤 ข้อมูลลูกค้า
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
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
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      นามสกุล *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
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
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    อีเมล *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="0812345678"
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

              {/* Billing Address */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  📍 ที่อยู่สำหรับออกใบเสร็จ
                </h2>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    ที่อยู่
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      เมือง/อำเภอ
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
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
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                      จังหวัด
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
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

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    style={{
                      width: '200px',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  🏦 วิธีการชำระเงิน
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '12px',
                    border: '2px solid #4CAF50',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#f8fff8'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontSize: '16px' }}>🏦 โอนเงินผ่านธนาคารกสิกรไทย</span>
                  </label>
                </div>

                {formData.paymentMethod === 'bank_transfer' && (
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#f8fff8',
                    borderRadius: '8px',
                    border: '2px solid #4CAF50'
                  }}>
                    {/* Bank Account Info */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #4CAF50'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#4CAF50'
                      }}>
                        🏦 ข้อมูลบัญชีธนาคาร
                      </h3>
                      
                      <div style={{ display: 'grid', gap: '8px', fontSize: '16px' }}>
                        <div><strong>ธนาคาร:</strong> กสิกรไทย</div>
                        <div><strong>ชื่อบัญชี:</strong> ฟิสิกส์พี่เต้ย Learning System</div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px'
                        }}>
                          <strong>เลขที่บัญชี:</strong> 
                          <span style={{ 
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '18px',
                            fontWeight: 'bold'
                          }}>
                            123-4-56789-0
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('1234567890');
                              alert('คัดลอกเลขบัญชีแล้ว!');
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            📋 คัดลอก
                          </button>
                        </div>
                        <div style={{ 
                          color: '#dc3545',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          <strong>จำนวนเงิน:</strong> {formatPrice(getCartTotal())}
                        </div>
                      </div>
                    </div>

                    {/* Transfer Instructions */}
                    <div style={{
                      backgroundColor: '#fff3cd',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                        📝 วิธีการโอนเงิน:
                      </h4>
                      <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                        <li>โอนเงินตามจำนวนที่ระบุข้างต้น</li>
                        <li>ถ่ายรูปหลักฐานการโอนเงิน (สลิป)</li>
                        <li>อัพโหลดสลิปในช่องด้านล่าง</li>
                        <li>กรอกข้อมูลการโอนให้ครบถ้วน</li>
                        <li>กดยืนยันการสั่งซื้อ</li>
                      </ol>
                    </div>

                    {/* Transfer Details Form */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                          อัพโหลดสลิปการโอนเงิน *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setFormData(prev => ({
                              ...prev,
                              transferSlip: file
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px dashed #4CAF50',
                            borderRadius: '6px',
                            fontSize: '16px',
                            backgroundColor: 'white'
                          }}
                        />
                        <small style={{ color: '#6c757d', fontSize: '12px' }}>
                          รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
                        </small>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                            วันที่โอน *
                          </label>
                          <input
                            type="date"
                            name="transferDate"
                            value={formData.transferDate}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #4CAF50',
                              borderRadius: '6px',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                            เวลาที่โอน *
                          </label>
                          <input
                            type="time"
                            name="transferTime"
                            value={formData.transferTime}
                            onChange={handleInputChange}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #4CAF50',
                              borderRadius: '6px',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                          จำนวนเงินที่โอน *
                        </label>
                        <input
                          type="number"
                          name="transferAmount"
                          value={formData.transferAmount}
                          onChange={handleInputChange}
                          placeholder={getCartTotal().toString()}
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #4CAF50',
                            borderRadius: '6px',
                            fontSize: '16px'
                          }}
                        />
                        <small style={{ color: '#6c757d', fontSize: '12px' }}>
                          ควรตรงกับยอดรวม: {formatPrice(getCartTotal())}
                        </small>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#d1ecf1',
                      borderRadius: '6px',
                      border: '1px solid #bee5eb',
                      fontSize: '14px',
                      color: '#0c5460'
                    }}>
                      💡 <strong>หมายเหตุ:</strong> หลังจากยืนยันการสั่งซื้อ เราจะตรวจสอบการโอนเงินภายใน 1-2 ชั่วโมง 
                      และจะส่งอีเมลยืนยันให้คุณทราบ
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
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
                  📋 สรุปคำสั่งซื้อ
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  {items.map((item) => (
                    <div key={`${item.type}-${item.id}`} style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f3f4'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {item.coverImageUrl ? (
                          <img 
                            src={item.coverImageUrl} 
                            alt={item.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '20px' }}>
                            {item.type === 'ebook' ? '📚' : '🎓'}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '500',
                          marginBottom: '4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6c757d',
                          marginBottom: '4px'
                        }}>
                          {item.quantity > 1 && `${item.quantity} × `}
                          {formatPrice(item.discountPrice || item.price)}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          color: '#212529'
                        }}>
                          {formatPrice((item.discountPrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
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
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                {error && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: loading ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  {loading ? '⏳ กำลังดำเนินการ...' : '🛒 ยืนยันการสั่งซื้อ'}
                </button>

                <Link 
                  href="/cart"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'white',
                    color: '#6c757d',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    textAlign: 'center',
                    border: '2px solid #dee2e6'
                  }}
                >
                  ← กลับไปยังตะกร้า
                </Link>

                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#6c757d',
                  textAlign: 'center'
                }}>
                  🔒 ข้อมูลของคุณปลอดภัยและเข้ารหัส<br/>
                  การชำระเงินผ่านระบบที่ปลอดภัย
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}