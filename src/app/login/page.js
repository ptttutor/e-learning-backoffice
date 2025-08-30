"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithLine } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#212529'
          }}>
            เข้าสู่ระบบ
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#6c757d',
            fontSize: '16px'
          }}>
            เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500',
              color: '#495057'
            }}>
              📧 อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              placeholder="example@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500',
              color: '#495057'
            }}>
              🔒 รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              placeholder="รหัสผ่านของคุณ"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#007bff';
            }}
          >
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : '🚀 เข้าสู่ระบบ'}
          </button>
        </form>

        {/* LINE Login */}
        <div style={{ 
          textAlign: 'center', 
          margin: '24px 0',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px 0'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: '#e9ecef'
            }}></div>
            <span style={{
              backgroundColor: 'white',
              padding: '0 16px',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              หรือ
            </span>
          </div>
          
          <button
            onClick={loginWithLine}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#00B900',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#009900'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00B900'}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            เข้าสู่ระบบด้วย LINE
          </button>
        </div>

        {/* Register Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>
            ยังไม่มีบัญชี?
          </p>
          <Link 
            href="/register"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            📝 สมัครสมาชิก
          </Link>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link 
            href="/"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← กลับไปหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}