"use client";
import { useState, useEffect } from 'react';

export default function PostTypesPage() {
  const [postTypes, setPostTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPostType, setEditingPostType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchPostTypes();
  }, []);

  const fetchPostTypes = async () => {
    try {
      const response = await fetch('/api/admin/post-types');
      const data = await response.json();
      setPostTypes(data);
    } catch (error) {
      console.error('Error fetching post types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPostType ? `/api/admin/post-types/${editingPostType.id}` : '/api/admin/post-types';
      const method = editingPostType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPostTypes();
        setShowForm(false);
        setEditingPostType(null);
        setFormData({ name: '', description: '', isActive: true });
      }
    } catch (error) {
      console.error('Error saving post type:', error);
    }
  };

  const handleEdit = (postType) => {
    setEditingPostType(postType);
    setFormData({
      name: postType.name,
      description: postType.description || '',
      isActive: postType.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทโพสต์นี้?')) {
      try {
        const response = await fetch(`/api/admin/post-types/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchPostTypes();
        }
      } catch (error) {
        console.error('Error deleting post type:', error);
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
          จัดการประเภทโพสต์
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
          เพิ่มประเภทใหม่
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2>{editingPostType ? 'แก้ไขประเภทโพสต์' : 'เพิ่มประเภทโพสต์ใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  ชื่อประเภท *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  เปิดใช้งาน
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPostType(null);
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
                  {editingPostType ? 'อัปเดต' : 'สร้าง'}
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
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ชื่อประเภท</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>คำอธิบาย</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>สถานะ</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>จำนวนโพสต์</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>วันที่สร้าง</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {postTypes.map((postType) => (
              <tr key={postType.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{postType.name}</td>
                <td style={{ padding: '16px', color: '#666' }}>
                  {postType.description || '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: postType.isActive ? '#d4edda' : '#f8d7da',
                    color: postType.isActive ? '#155724' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {postType.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {postType._count?.posts || 0} โพสต์
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {new Date(postType.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(postType)}
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
                    onClick={() => handleDelete(postType.id)}
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
        
        {postTypes.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
            ไม่มีประเภทโพสต์
          </div>
        )}
      </div>
    </div>
  );
}