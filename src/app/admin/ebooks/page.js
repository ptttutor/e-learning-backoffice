"use client";
import { useState, useEffect } from 'react';

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    isbn: '',
    price: 0,
    discountPrice: 0,
    coverImageUrl: '',
    previewUrl: '',
    fileUrl: '',
    fileSize: 0,
    pageCount: 0,
    language: 'th',
    format: 'PDF',
    isPhysical: false,
    weight: 0,
    dimensions: '',
    stock: 0,
    isActive: true,
    isFeatured: false,
    categoryId: '',
    publishedAt: ''
  });

  useEffect(() => {
    fetchEbooks();
    fetchCategories();
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await fetch('/api/admin/ebooks');
      const data = await response.json();
      setEbooks(data);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/ebook-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEbook ? `/api/admin/ebooks/${editingEbook.id}` : '/api/admin/ebooks';
      const method = editingEbook ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stock: parseInt(formData.stock),
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        fetchEbooks();
        setShowForm(false);
        setEditingEbook(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving ebook:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      author: '',
      isbn: '',
      price: 0,
      discountPrice: 0,
      coverImageUrl: '',
      previewUrl: '',
      fileUrl: '',
      fileSize: 0,
      pageCount: 0,
      language: 'th',
      format: 'PDF',
      isPhysical: false,
      weight: 0,
      dimensions: '',
      stock: 0,
      isActive: true,
      isFeatured: false,
      categoryId: '',
      publishedAt: ''
    });
  };

  const handleEdit = (ebook) => {
    setEditingEbook(ebook);
    setFormData({
      title: ebook.title,
      description: ebook.description || '',
      author: ebook.author,
      isbn: ebook.isbn || '',
      price: ebook.price,
      discountPrice: ebook.discountPrice || 0,
      coverImageUrl: ebook.coverImageUrl || '',
      previewUrl: ebook.previewUrl || '',
      fileUrl: ebook.fileUrl || '',
      fileSize: ebook.fileSize || 0,
      pageCount: ebook.pageCount || 0,
      language: ebook.language,
      format: ebook.format,
      isPhysical: ebook.isPhysical,
      weight: ebook.weight || 0,
      dimensions: ebook.dimensions || '',
      stock: ebook.stock,
      isActive: ebook.isActive,
      isFeatured: ebook.isFeatured,
      categoryId: ebook.categoryId || '',
      publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบ eBook นี้?')) {
      try {
        const response = await fetch(`/api/admin/ebooks/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchEbooks();
        }
      } catch (error) {
        console.error('Error deleting ebook:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          จัดการ eBooks
        </h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          เพิ่ม eBook ใหม่
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: '20px'
          }}>
            <h2>{editingEbook ? 'แก้ไข eBook' : 'เพิ่ม eBook ใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    ชื่อหนังสือ *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    ผู้เขียน *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    ราคา *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    ราคาลด
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    หมวดหมู่
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    รูปแบบ
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="PDF">PDF</option>
                    <option value="EPUB">EPUB</option>
                    <option value="MOBI">MOBI</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPhysical}
                    onChange={(e) => setFormData({ ...formData, isPhysical: e.target.checked })}
                  />
                  หนังสือกายภาพ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  เปิดใช้งาน
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  แนะนำ
                </label>
              </div>

              {formData.isPhysical && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      น้ำหนัก (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      ขนาด
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="21x29.7x2 cm"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      สต็อก
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEbook(null);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingEbook ? 'อัปเดต' : 'สร้าง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>หนังสือ</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ผู้เขียน</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>ราคา</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>รูปแบบ</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>สต็อก</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>สถานะ</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {ebooks.map((ebook) => (
              <tr key={ebook.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {ebook.coverImageUrl && (
                      <img 
                        src={ebook.coverImageUrl} 
                        alt={ebook.title}
                        style={{ 
                          width: '40px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{ebook.title}</div>
                      {ebook.isFeatured && (
                        <span style={{
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}>
                          ⭐ แนะนำ
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>{ebook.author}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div>
                    {ebook.discountPrice ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                          ฿{ebook.price}
                        </span>
                        <br />
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                          ฿{ebook.discountPrice}
                        </span>
                      </>
                    ) : (
                      <span>฿{ebook.price}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {ebook.format}
                  </span>
                  {ebook.isPhysical && (
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      📦 กายภาพ
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: ebook.stock > 10 ? '#d4edda' : ebook.stock > 0 ? '#fff3cd' : '#f8d7da',
                    color: ebook.stock > 10 ? '#155724' : ebook.stock > 0 ? '#856404' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {ebook.stock}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: ebook.isActive ? '#d4edda' : '#f8d7da',
                    color: ebook.isActive ? '#155724' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {ebook.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(ebook)}
                    style={{
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px',
                      fontSize: '12px'
                    }}
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(ebook.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ebooks.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
            ไม่มี eBook
          </div>
        )}
      </div>
    </div>
  );
}