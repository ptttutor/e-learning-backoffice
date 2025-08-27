# API Documentation - Post System

## ภาพรวม
API สำหรับระบบจัดการโพสต์ที่รองรับการดึงข้อมูลโพสต์, ประเภทโพสต์, และแท็ก พร้อมการกรองและการค้นหาที่หลากหลาย

## Base URL
```
/api
```

## Posts API

### 1. ดึงรายการโพสต์ทั้งหมด
```
GET /api/posts
```

#### Query Parameters
- `postType` (string, optional) - กรองตามชื่อประเภทโพสต์
- `limit` (number, optional) - จำกัดจำนวนผลลัพธ์
- `featured` (boolean, optional) - กรองเฉพาะโพสต์แนะนำ (true/false)

#### ตัวอย่างการใช้งาน
```javascript
// ดึงโพสต์ทั้งหมด
fetch('/api/posts')

// ดึงโพสต์ประเภท "บทความ" 10 รายการ
fetch('/api/posts?postType=บทความ&limit=10')

// ดึงโพสต์แนะนำ
fetch('/api/posts?featured=true')

// ดึงโพสต์ประเภท "ข่าวสาร" ที่เป็นโพสต์แนะนำ
fetch('/api/posts?postType=ข่าวสาร&featured=true&limit=5')
```

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "หัวข้อโพสต์",
      "content": "เนื้อหาโพสต์",
      "excerpt": "สรุปโพสต์",
      "imageUrl": "url รูปภาพ desktop",
      "imageUrlMobileMode": "url รูปภาพ mobile",
      "slug": "url-slug",
      "isActive": true,
      "isFeatured": false,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "name": "ชื่อผู้เขียน",
        "email": "email@example.com"
      },
      "postType": {
        "id": "uuid",
        "name": "บทความ",
        "description": "คำอธิบายประเภท"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "JavaScript",
          "slug": "javascript",
          "color": "#f7df1e"
        }
      ]
    }
  ],
  "count": 10
}
```

### 2. ดึงโพสต์ตาม ID
```
GET /api/posts/[id]
```

#### ตัวอย่างการใช้งาน
```javascript
fetch('/api/posts/uuid-here')
```

### 3. ดึงโพสต์ตาม Slug
```
GET /api/posts/slug/[slug]
```

#### ตัวอย่างการใช้งาน
```javascript
fetch('/api/posts/slug/nextjs-for-beginners')
```

### 4. ดึงโพสต์ตามแท็ก
```
GET /api/posts/tag/[tagSlug]
```

#### Query Parameters
- `limit` (number, optional) - จำกัดจำนวนผลลัพธ์

#### ตัวอย่างการใช้งาน
```javascript
// ดึงโพสต์ที่มีแท็ก "javascript"
fetch('/api/posts/tag/javascript')

// ดึงโพสต์ที่มีแท็ก "react" 5 รายการ
fetch('/api/posts/tag/react?limit=5')
```

#### Response Format
```json
{
  "success": true,
  "data": [...], // รายการโพสต์
  "count": 5,
  "tag": {
    "id": "uuid",
    "name": "JavaScript",
    "slug": "javascript",
    "color": "#f7df1e"
  }
}
```

## Post Types API

### 1. ดึงรายการประเภทโพสต์ที่เปิดใช้งาน
```
GET /api/post-types
```

#### ตัวอย่างการใช้งาน
```javascript
fetch('/api/post-types')
```

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "บทความ",
      "description": "บทความทั่วไป",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "posts": 5
      }
    }
  ],
  "count": 4
}
```

## Tags API

### 1. ดึงรายการแท็กที่เปิดใช้งาน
```
GET /api/tags
```

#### ตัวอย่างการใช้งาน
```javascript
fetch('/api/tags')
```

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "JavaScript",
      "slug": "javascript",
      "color": "#f7df1e",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "posts": 3
      }
    }
  ],
  "count": 6
}
```

## Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## HTTP Status Codes
- `200` - Success
- `404` - Not Found
- `500` - Internal Server Error

## ฟีเจอร์หลัก

### การกรองข้อมูล
- ✅ แสดงเฉพาะโพสต์ที่เปิดใช้งาน (`isActive: true`)
- ✅ แสดงเฉพาะโพสต์ที่เผยแพร่แล้ว (`publishedAt <= now`)
- ✅ แสดงเฉพาะประเภทโพสต์ที่เปิดใช้งาน
- ✅ แสดงเฉพาะแท็กที่เปิดใช้งาน

### การเรียงลำดับ
- โพสต์แนะนำจะแสดงก่อน (`isFeatured: desc`)
- เรียงตามวันที่เผยแพร่ล่าสุด (`publishedAt: desc`)

### ข้อมูลที่ Join
- ข้อมูลผู้เขียน (author)
- ข้อมูลประเภทโพสต์ (postType)
- ข้อมูลแท็ก (tags)
- จำนวนโพสต์ในแต่ละประเภท/แท็ก

## ตัวอย่างการใช้งานใน Frontend

### React/Next.js
```javascript
// ดึงโพสต์ทั้งหมด
const fetchPosts = async () => {
  const response = await fetch('/api/posts');
  const result = await response.json();
  if (result.success) {
    setPosts(result.data);
  }
};

// ดึงโพสต์ตามประเภท
const fetchPostsByType = async (postType) => {
  const response = await fetch(`/api/posts?postType=${encodeURIComponent(postType)}`);
  const result = await response.json();
  if (result.success) {
    setPosts(result.data);
  }
};

// ดึงโพสต์แนะนำ
const fetchFeaturedPosts = async () => {
  const response = await fetch('/api/posts?featured=true&limit=5');
  const result = await response.json();
  if (result.success) {
    setFeaturedPosts(result.data);
  }
};
```

### การจัดการ Error
```javascript
const fetchPosts = async () => {
  try {
    const response = await fetch('/api/posts');
    const result = await response.json();
    
    if (!result.success) {
      console.error('API Error:', result.error);
      return;
    }
    
    setPosts(result.data);
  } catch (error) {
    console.error('Network Error:', error);
  }
};
```