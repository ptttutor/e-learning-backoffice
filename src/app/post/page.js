"use client";
import { useState, useEffect } from 'react';

export default function TestAPIPage() {
  const [posts, setPosts] = useState([]);
  const [postTypes, setPostTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedPostType, setSelectedPostType] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPostTypes();
    fetchTags();
    fetchPosts();
  }, []);

  const fetchPosts = async (postType = '', tagSlug = '', featured = false) => {
    setLoading(true);
    setError('');
    
    try {
      let url = '/api/posts';
      const params = new URLSearchParams();
      
      if (postType) params.append('postType', postType);
      if (featured) params.append('featured', 'true');
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      // ถ้าเลือกแท็ก ให้ใช้ API แท็กแทน
      if (tagSlug) {
        url = `/api/posts/tag/${tagSlug}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostTypes = async () => {
    try {
      const response = await fetch('/api/post-types');
      const result = await response.json();
      if (result.success) {
        setPostTypes(result.data);
      }
    } catch (err) {
      console.error('Error fetching post types:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const result = await response.json();
      if (result.success) {
        setTags(result.data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handlePostTypeChange = (postType) => {
    setSelectedPostType(postType);
    setSelectedTag('');
    fetchPosts(postType);
  };

  const handleTagChange = (tagSlug) => {
    setSelectedTag(tagSlug);
    setSelectedPostType('');
    fetchPosts('', tagSlug);
  };

  const handleFeaturedPosts = () => {
    setSelectedPostType('');
    setSelectedTag('');
    fetchPosts('', '', true);
  };

  const handleAllPosts = () => {
    setSelectedPostType('');
    setSelectedTag('');
    fetchPosts();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: 'bold' }}>
        ทดสอบ Posts API
      </h1>

      {/* Controls */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>ตัวกรอง</h2>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={handleAllPosts}
            style={{
              padding: '8px 16px',
              backgroundColor: !selectedPostType && !selectedTag ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ทั้งหมด
          </button>
          
          <button
            onClick={handleFeaturedPosts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            โพสต์แนะนำ
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ประเภทโพสต์
            </label>
            <select
              value={selectedPostType}
              onChange={(e) => handlePostTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">เลือกประเภท</option>
              {postTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name} ({type._count.posts} โพสต์)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              แท็ก
            </label>
            <select
              value={selectedTag}
              onChange={(e) => handleTagChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">เลือกแท็ก</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name} ({tag._count.posts} โพสต์)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>ผลลัพธ์</h2>
          <span style={{ color: '#666' }}>
            {loading ? 'กำลังโหลด...' : `${posts.length} รายการ`}
          </span>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
            กำลังโหลด...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
            ไม่มีโพสต์
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {posts.map((post) => (
              <div 
                key={post.id}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                      {post.title}
                      {post.isFeatured && (
                        <span style={{
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          marginLeft: '8px'
                        }}>
                          ⭐ แนะนำ
                        </span>
                      )}
                    </h3>
                    {post.excerpt && (
                      <p style={{ margin: '0 0 8px 0', color: '#666', lineHeight: '1.4' }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      style={{ 
                        width: '80px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        marginLeft: '16px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {post.postType.name}
                  </span>
                  
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    โดย {post.author.name}
                  </span>
                  
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(post.publishedAt).toLocaleDateString('th-TH')}
                  </span>

                  {post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {post.tags.map(tag => (
                        <span
                          key={tag.id}
                          style={{
                            backgroundColor: tag.color,
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '8px', fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                  ID: {post.id} | Slug: {post.slug}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}