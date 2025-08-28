"use client";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('ตะกร้าสินค้าว่างเปล่า');
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    router.push('/checkout');
  };

  if (items.length === 0) {
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
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛒</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              ตะกร้าสินค้าว่างเปล่า
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
            🛒 ตะกร้าสินค้า ({items.length} รายการ)
          </h1>
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
          {/* Cart Items */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '24px',
                  borderBottom: '1px solid #f1f3f4'
                }}>
                  {/* Item Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
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
                      <span style={{ fontSize: '32px' }}>
                        {item.type === 'ebook' ? '📚' : '🎓'}
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {item.title}
                    </h3>
                    
                    {item.author && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        โดย {item.author}
                      </p>
                    )}

                    {item.isPhysical && (
                      <div style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#389e0d'
                      }}>
                        📦 สินค้าต้องจัดส่ง
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      marginTop: '12px'
                    }}>
                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #dee2e6',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          −
                        </button>
                        <span style={{ 
                          minWidth: '40px', 
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #dee2e6',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right' }}>
                    {item.discountPrice ? (
                      <div>
                        <div style={{ 
                          textDecoration: 'line-through', 
                          color: '#6c757d',
                          fontSize: '14px'
                        }}>
                          {formatPrice(item.price)}
                        </div>
                        <div style={{ 
                          color: '#dc3545', 
                          fontSize: '18px', 
                          fontWeight: 'bold'
                        }}>
                          {formatPrice(item.discountPrice)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#28a745'
                      }}>
                        {formatPrice(item.price)}
                      </div>
                    )}
                    
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#212529',
                      marginTop: '8px'
                    }}>
                      รวม: {formatPrice((item.discountPrice || item.price) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  if (confirm('ต้องการล้างตะกร้าสินค้าทั้งหมดหรือไม่?')) {
                    clearCart();
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  border: '2px solid #dc3545',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🗑️ ล้างตะกร้าทั้งหมด
              </button>
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span>จำนวนสินค้า:</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)} รายการ</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span>ค่าจัดส่ง:</span>
                  <span style={{ color: '#28a745' }}>ฟรี</span>
                </div>
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

              <button
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                {isAuthenticated ? '🛒 ดำเนินการชำระเงิน' : '🔐 เข้าสู่ระบบเพื่อชำระเงิน'}
              </button>

              <Link 
                href="/ebooks"
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
                📚 เลือกซื้อเพิ่มเติม
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}