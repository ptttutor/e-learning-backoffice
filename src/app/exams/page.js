"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchExams();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedCategory, searchTerm, fetchExams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/exam-categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/exams?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setExams(result.data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dee2e6',
        padding: '48px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '48px', 
            fontWeight: 'bold',
            color: '#212529'
          }}>
            📝 คลังข้อสอบ
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '20px',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            รวบรวมข้อสอบจากหลากหลายวิชา เพื่อการเรียนรู้และฝึกฝนที่มีประสิทธิภาพ
          </p>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '48px 24px'
      }}>
        {/* Search and Filter */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                🔍 ค้นหาข้อสอบ
              </label>
              <input
                type="text"
                placeholder="ชื่อข้อสอบ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                📁 หมวดหมู่
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count.exams})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 0',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '18px' }}>กำลังโหลดข้อสอบ...</div>
          </div>
        ) : exams.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 0',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>📝</div>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '24px',
              color: '#495057'
            }}>
              ไม่พบข้อสอบ
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#6c757d',
              fontSize: '16px'
            }}>
              ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ดู
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {exams.map((exam) => (
              <div key={exam.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}>
                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      fontSize: '32px',
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📝
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#212529',
                        lineHeight: '1.3'
                      }}>
                        {exam.title}
                      </h3>
                      {exam.category && (
                        <div style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {exam.category.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {exam.description && (
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      color: '#6c757d',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {exam.description.length > 100 
                        ? `${exam.description.substring(0, 100)}...` 
                        : exam.description}
                    </p>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      📁 {exam._count.files} ไฟล์
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      📅 {formatDate(exam.createdAt)}
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <Link 
                      href={`/exams/${exam.id}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                      📖 ดูรายละเอียด
                    </Link>
                  ) : (
                    <Link 
                      href="/login?redirect=/exams"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                      🔐 เข้าสู่ระบบเพื่อดูข้อสอบ
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}