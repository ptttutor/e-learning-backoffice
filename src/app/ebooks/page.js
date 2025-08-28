"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchEbooks();
  }, []);

  useEffect(() => {
    fetchEbooks();
  }, [selectedCategory, selectedFormat, searchTerm, showFeatured, currentPage]);

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedFormat) params.append('format', selectedFormat);
      if (searchTerm) params.append('search', searchTerm);
      if (showFeatured) params.append('featured', 'true');
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/ebooks?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setEbooks(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/ebook-categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEbooks();
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedFormat('');
    setSearchTerm('');
    setShowFeatured(false);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#ffc107' }}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" style={{ color: '#ffc107' }}>☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ color: '#e9ecef' }}>★</span>);
    }
    return stars;
  };

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
            📚 eBooks
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6c757d',
            fontSize: '16px'
          }}>
            ค้นหาและซื้อหนังสืออิเล็กทรอนิกส์คุณภาพสูง
          </p>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Search */}
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="ค้นหาหนังสือ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name} ({category._count.ebooks})
                </option>
              ))}
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">ทุกรูปแบบ</option>
              <option value="PDF">PDF</option>
              <option value="EPUB">EPUB</option>
              <option value="MOBI">MOBI</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e) => {
                  setShowFeatured(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              แสดงเฉพาะหนังสือแนะนำ
            </label>
            
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {loading ? 'กำลังโหลด...' : `พบ ${pagination.total || 0} เล่ม`}
          </h2>
          {pagination.totalPages > 1 && (
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              หน้า {pagination.page} จาก {pagination.totalPages}
            </div>
          )}
        </div>

        {/* eBooks Grid */}
        {loading ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d'
              }}>
                กำลังโหลด...
              </div>
            ))}
          </div>
        ) : ebooks.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3>ไม่พบหนังสือที่ตรงกับเงื่อนไข</h3>
            <p>ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {ebooks.map((ebook) => (
              <Link 
                key={ebook.id} 
                href={`/ebooks/${ebook.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                >
                  {/* Cover Image */}
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {ebook.coverImageUrl ? (
                      <img 
                        src={ebook.coverImageUrl} 
                        alt={ebook.title}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ 
                      display: ebook.coverImageUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: '48px',
                      color: '#dee2e6'
                    }}>
                      📖
                    </div>
                    
                    {/* Featured Badge */}
                    {ebook.isFeatured && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ แนะนำ
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {ebook.title}
                    </h3>
                    
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      โดย {ebook.author}
                    </p>

                    {ebook.category && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: '#e9ecef',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#495057'
                        }}>
                          {ebook.category.name}
                        </span>
                      </div>
                    )}

                    {/* Rating */}
                    {ebook.averageRating > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div>{renderStars(ebook.averageRating)}</div>
                        <span style={{ fontSize: '14px', color: '#6c757d' }}>
                          ({ebook._count.reviews})
                        </span>
                      </div>
                    )}

                    {/* Format and Pages */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      <span>📄 {ebook.format}</span>
                      {ebook.pageCount && <span>📖 {ebook.pageCount} หน้า</span>}
                      {ebook.isPhysical && <span>📦 กายภาพ</span>}
                    </div>

                    {/* Price */}
                    <div style={{ marginTop: 'auto' }}>
                      {ebook.discountPrice ? (
                        <div>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#6c757d',
                            fontSize: '14px'
                          }}>
                            {formatPrice(ebook.price)}
                          </span>
                          <div style={{ 
                            color: '#dc3545', 
                            fontSize: '20px', 
                            fontWeight: 'bold'
                          }}>
                            {formatPrice(ebook.discountPrice)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold',
                          color: '#28a745'
                        }}>
                          {formatPrice(ebook.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                color: currentPage === 1 ? '#6c757d' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← ก่อนหน้า
            </button>
            
            <span style={{ 
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {currentPage} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === pagination.totalPages ? '#e9ecef' : '#007bff',
                color: currentPage === pagination.totalPages ? '#6c757d' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}