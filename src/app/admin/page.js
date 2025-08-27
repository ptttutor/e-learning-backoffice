"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    postTypes: 0,
    tags: 0,
    courses: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const [postsRes, postTypesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/post-types'),
        fetch('/api/admin/tags')
      ]);

      const [posts, postTypes, tags] = await Promise.all([
        postsRes.json(),
        postTypesRes.json(),
        tagsRes.json()
      ]);

      setStats({
        posts: posts.length,
        postTypes: postTypes.length,
        tags: tags.length,
        courses: 0, // TODO: เพิ่ม API สำหรับ courses
        users: 0    // TODO: เพิ่ม API สำหรับ users
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      const posts = await response.json();
      setRecentPosts(posts.slice(0, 5)); // แสดง 5 โพสต์ล่าสุด
    } catch (error) {
      console.error('Error fetching recent posts:', error);
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
      <h1 style={{ margin: '0 0 32px 0', fontSize: '32px', fontWeight: 'bold' }}>
        แดชบอร์ด Admin
      </h1>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            โพสต์ทั้งหมด
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.posts}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            ประเภทโพสต์
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.postTypes}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            แท็กทั้งหมด
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.tags}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            คอร์สเรียน
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {stats.courses}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            โพสต์ล่าสุด
          </h2>
          <a 
            href="/admin/posts"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ดูทั้งหมด →
          </a>
        </div>

        {recentPosts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentPosts.map((post) => (
              <div 
                key={post.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '16px', 
                      fontWeight: 'bold' 
                    }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#666', 
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {post.excerpt.length > 150 ? `${post.excerpt.substring(0, 150)}...` : post.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: '#e9ecef',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}>
                        {post.postType?.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        โดย {post.author?.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(post.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {post.isFeatured && (
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
                    <span style={{
                      backgroundColor: post.isActive ? '#d4edda' : '#f8d7da',
                      color: post.isActive ? '#155724' : '#721c24',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}>
                      {post.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '32px' }}>
            ยังไม่มีโพสต์
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>
          การดำเนินการด่วน
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="/admin/posts"
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            + เพิ่มโพสต์ใหม่
          </a>
          <a
            href="/admin/post-types"
            style={{
              display: 'inline-block',
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            + เพิ่มประเภทโพสต์
          </a>
          <a
            href="/admin/tags"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffc107',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            + เพิ่มแท็กใหม่
          </a>
        </div>
      </div>
    </div>
  );
}
