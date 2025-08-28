"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('Exam data:', result.data); // Debug log
        setExam(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/exams');
      return;
    }
    
    if (params.id && isAuthenticated) {
      fetchExam();
    }
  }, [params.id, isAuthenticated, authLoading, router, fetchExam]);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('image')) return '🖼️';
    return '📁';
  };

  const handleDownload = (filePath, fileName) => {
    if (!filePath || filePath === '#') {
      alert('ไม่พบไฟล์ที่ต้องการดาวน์โหลด');
      return;
    }
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <div style={{ fontSize: '18px', color: '#6c757d' }}>
            {authLoading ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'กำลังโหลดข้อสอบ...'}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || error || !exam) {
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>❌</div>
            <h1 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '32px', 
              fontWeight: 'bold'
            }}>
              ไม่พบข้อสอบ
            </h1>
            <p style={{ 
              margin: '0 0 32px 0', 
              fontSize: '18px',
              color: '#6c757d'
            }}>
              {error || 'ข้อสอบที่คุณต้องการดูอาจถูกลบหรือไม่มีอยู่'}
            </p>
            <Link 
              href="/exams"
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
              🔙 กลับไปหน้าคลังข้อสอบ
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
          <div style={{ marginBottom: '16px' }}>
            <Link 
              href="/exams"
              style={{
                color: '#007bff',
                textDecoration: 'none',
                fontSize: '16px'
              }}
            >
              ← กลับไปหน้าคลังข้อสอบ
            </Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              fontSize: '48px',
              width: '64px',
              height: '64px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📝
            </div>
            <div>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: '#212529'
              }}>
                {exam.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {exam.category && (
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    📁 {exam.category.name}
                  </div>
                )}
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  📅 สร้างเมื่อ {formatDate(exam.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Main Content */}
          <div>
            {/* Description */}
            {exam.description && (
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#212529'
                }}>
                  📋 รายละเอียด
                </h2>
                <p style={{ 
                  margin: 0, 
                  color: '#495057',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>
                  {exam.description}
                </p>
              </div>
            )}

            {/* Files */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#212529'
              }}>
                📁 ไฟล์ข้อสอบ ({exam.files.length})
              </h2>

              {exam.files.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px 0',
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                  <div style={{ fontSize: '16px' }}>ยังไม่มีไฟล์ข้อสอบ</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {exam.files.map((file) => (
                    <div key={file.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>
                          {getFileIcon(file.fileType)}
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#212529',
                            marginBottom: '4px'
                          }}>
                            {file.fileName}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6c757d',
                            display: 'flex',
                            gap: '16px'
                          }}>
                            <span>📏 {formatFileSize(file.fileSize)}</span>
                            <span>📅 {formatDate(file.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      {file.filePath ? (
                        <button
                          onClick={() => handleDownload(file.filePath, file.fileName)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                          📥 ดาวน์โหลด
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          ไฟล์ไม่พร้อมใช้งาน
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '24px'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#212529'
              }}>
                📊 ข้อมูลข้อสอบ
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#6c757d' }}>📁 จำนวนไฟล์</span>
                  <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                    {exam.files.length}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#6c757d' }}>📅 วันที่สร้าง</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {new Date(exam.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#6c757d' }}>📅 อัพเดทล่าสุด</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {new Date(exam.updatedAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e9ecef' }}>
                <Link 
                  href="/exams"
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
                  🔙 กลับไปหน้าคลังข้อสอบ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}