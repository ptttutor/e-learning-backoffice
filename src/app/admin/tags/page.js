"use client";
import { useState, useEffect } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#007bff',
    isActive: true
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTag ? `/api/admin/tags/${editingTag.id}` : '/api/admin/tags';
      const method = editingTag ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        fetchTags();
        setShowForm(false);
        setEditingTag(null);
        setFormData({ name: '', slug: '', color: '#007bff', isActive: true });
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || '#007bff',
      isActive: tag.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบแท็กนี้?')) {
      try {
        const response = await fetch(`/api/admin/tags/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTags();
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
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
          จัดการแท็ก
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
          เพิ่มแท็กใหม่
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
            <h2>{editingTag ? 'แก้ไขแท็ก' : 'เพิ่มแท็กใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  ชื่อแท็ก *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: formData.slug || generateSlug(name)
                    });
                  }}
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
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  หากไม่ระบุ จะสร้างอัตโนมัติจากชื่อแท็ก
                </small>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  สี
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: formData.color,
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    ตัวอย่าง
                  </div>
                </div>
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
                    setEditingTag(null);
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
                  {editingTag ? 'อัปเดต' : 'สร้าง'}
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
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>แท็ก</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Slug</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>สี</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>สถานะ</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>จำนวนโพสต์</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>วันที่สร้าง</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    backgroundColor: tag.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {tag.name}
                  </span>
                </td>
                <td style={{ padding: '16px', fontFamily: 'monospace', color: '#666' }}>
                  {tag.slug}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: tag.color,
                        borderRadius: '50%',
                        border: '1px solid #ddd'
                      }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                      {tag.color}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: tag.isActive ? '#d4edda' : '#f8d7da',
                    color: tag.isActive ? '#155724' : '#721c24',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {tag.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {tag._count?.posts || 0} โพสต์
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {new Date(tag.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(tag)}
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
                    onClick={() => handleDelete(tag.id)}
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
        
        {tags.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
            ไม่มีแท็ก
          </div>
        )}
      </div>
    </div>
  );
}