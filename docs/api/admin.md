# Admin Panel API Documentation

## Overview

Admin Panel API จัดการระบบทั้งหมดสำหรับผู้ดูแลระบบ รวมถึงการจัดการผู้ใช้ คอร์ส e-book คำสั่งซื้อ และสถิติต่างๆ

## Dashboard & Statistics

### 1. Get Dashboard Statistics

#### GET `/api/admin/dashboard/stats`
ดึงสถิติสำหรับ dashboard หลัก

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 2500000,
    "totalCustomers": 850,
    "totalProducts": 45,
    "pendingOrders": 25,
    "completedOrders": 1200,
    "paymentMethods": [
      {
        "method": "BANK_TRANSFER",
        "_count": {
          "method": 1100
        }
      },
      {
        "method": "FREE",
        "_count": {
          "method": 150
        }
      }
    ],
    "monthlyRevenue": [
      {
        "month": "ม.ค. 2024",
        "revenue": 450000
      },
      {
        "month": "ก.พ. 2024",
        "revenue": 520000
      }
    ],
    "topProducts": [
      {
        "id": "product_id",
        "title": "Popular Course",
        "type": "course",
        "sales": 125,
        "instructor": {
          "name": "Instructor Name"
        }
      },
      {
        "id": "ebook_id",
        "title": "Best Selling Ebook",
        "type": "ebook",
        "sales": 98,
        "author": "Author Name",
        "coverImageUrl": "https://cloudinary.com/cover.jpg"
      }
    ]
  }
}
```

## User Management

### 1. Get All Users

#### GET `/api/admin/users`
ดึงรายการผู้ใช้ทั้งหมด

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `role`: Filter by role (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `search`: Search by name or email (optional)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "STUDENT",
      "lineId": "line_user_id",
      "image": "https://cloudinary.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "enrollments": 5,
        "orders": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 850,
    "pages": 17
  }
}
```

### 2. Update User Role

#### PUT `/api/admin/users?id=user_id`
อัปเดต role ของผู้ใช้

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "role": "INSTRUCTOR"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "INSTRUCTOR",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Course Management (Admin)

### 1. Get All Courses

#### GET `/api/admin/courses`
ดึงรายการคอร์สทั้งหมด (ทุก status)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "price": 1500,
      "duration": 120,
      "isFree": false,
      "status": "PUBLISHED",
      "coverImageUrl": "https://cloudinary.com/image.jpg",
      "coverPublicId": "cloudinary_public_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "instructor": {
        "id": "instructor_id",
        "name": "Instructor Name",
        "email": "instructor@example.com",
        "role": "INSTRUCTOR"
      },
      "category": {
        "id": "category_id",
        "name": "Category Name",
        "description": "Category description"
      },
      "chapters": [
        {
          "id": "chapter_id",
          "title": "Chapter 1",
          "order": 1
        }
      ],
      "enrollments": [
        {
          "id": "enrollment_id",
          "userId": "user_id",
          "status": "ACTIVE"
        }
      ]
    }
  ]
}
```

### 2. Create Course

#### POST `/api/admin/courses`
สร้างคอร์สใหม่

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Course Title",
  "description": "Course description",
  "price": 1500,
  "duration": 120,
  "isFree": false,
  "status": "DRAFT",
  "instructorId": "instructor_id",
  "categoryId": "category_id",
  "coverImageUrl": "https://cloudinary.com/image.jpg",
  "coverPublicId": "cloudinary_public_id"
}
```

### 3. Update Course

#### PUT `/api/admin/courses?id=course_id`
อัปเดตข้อมูลคอร์ส

### 4. Delete Course

#### DELETE `/api/admin/courses?id=course_id`
ลบคอร์ส

## E-book Management (Admin)

### 1. Get All E-books

#### GET `/api/admin/ebooks`
ดึงรายการ e-book ทั้งหมด

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ebook_id",
      "title": "Ebook Title",
      "description": "Ebook description",
      "author": "Author Name",
      "price": 500,
      "discountPrice": 450,
      "isPhysical": true,
      "isActive": true,
      "coverImageUrl": "https://cloudinary.com/cover.jpg",
      "fileUrl": "https://cloudinary.com/ebook.pdf",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "category_id",
        "name": "Category Name"
      },
      "_count": {
        "orders": 25,
        "reviews": 8
      }
    }
  ]
}
```

### 2. Create E-book

#### POST `/api/admin/ebooks`
สร้าง e-book ใหม่

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Ebook Title",
  "description": "Ebook description",
  "author": "Author Name",
  "price": 500,
  "discountPrice": 450,
  "isPhysical": true,
  "isActive": true,
  "categoryId": "category_id",
  "coverImageUrl": "https://cloudinary.com/cover.jpg",
  "fileUrl": "https://cloudinary.com/ebook.pdf"
}
```

## Order Management (Admin)

### 1. Get All Orders

#### GET `/api/admin/orders`
ดึงรายการคำสั่งซื้อทั้งหมด

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `status`: Order status filter
- `paymentStatus`: Payment status filter
- `page`: Page number
- `limit`: Items per page

### 2. Update Order Status

#### PUT `/api/admin/orders?id=order_id`
อัปเดตสถานะคำสั่งซื้อ

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

### 3. Verify Payment

#### PUT `/api/admin/payments?id=payment_id`
ตรวจสอบและอนุมัติการชำระเงิน

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "COMPLETED",
  "verifiedAt": "2024-01-01T01:00:00.000Z",
  "notes": "Payment verified successfully"
}
```

## Shipping Management

### 1. Get Shipping Records

#### GET `/api/admin/shipping`
ดึงรายการการจัดส่งทั้งหมด

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "shipping_id",
      "orderId": "order_id",
      "recipientName": "Recipient Name",
      "recipientPhone": "0812345678",
      "address": "123 Main St",
      "district": "District",
      "province": "Province",
      "postalCode": "12345",
      "shippingMethod": "STANDARD",
      "status": "PENDING",
      "trackingNumber": null,
      "shippedAt": null,
      "deliveredAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "order": {
        "id": "order_id",
        "total": 550,
        "user": {
          "name": "User Name",
          "email": "user@example.com"
        },
        "ebook": {
          "title": "Ebook Title",
          "author": "Author Name"
        }
      }
    }
  ]
}
```

### 2. Update Shipping Status

#### PUT `/api/admin/shipping?id=shipping_id`
อัปเดตสถานะการจัดส่ง

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TH123456789",
  "shippedAt": "2024-01-02T00:00:00.000Z"
}
```

## Content Management

### 1. Categories Management

#### GET `/api/admin/categories`
ดึงรายการหมวดหมู่ทั้งหมด

#### POST `/api/admin/categories`
สร้างหมวดหมู่ใหม่

#### PUT `/api/admin/categories?id=category_id`
อัปเดตหมวดหมู่

#### DELETE `/api/admin/categories?id=category_id`
ลบหมวดหมู่

### 2. Posts Management

#### GET `/api/admin/posts`
ดึงรายการโพสต์ทั้งหมด

#### POST `/api/admin/posts`
สร้างโพสต์ใหม่

#### PUT `/api/admin/posts?id=post_id`
อัปเดตโพสต์

#### DELETE `/api/admin/posts?id=post_id`
ลบโพสต์

## Access Control

### Admin Role Requirements
- ทุก endpoint ต้องมี JWT token ที่ valid
- User ต้องมี role = 'ADMIN'
- Token ต้องไม่หมดอายุ

### Permission Levels
- **ADMIN**: เข้าถึงได้ทุก endpoint
- **INSTRUCTOR**: เข้าถึงได้เฉพาะคอร์สของตนเอง
- **STUDENT**: ไม่สามารถเข้าถึง admin endpoints

## Error Handling

### Common Admin Errors
```json
{
  "success": false,
  "error": "Unauthorized - Admin access required"
}
```

### Validation Errors
```json
{
  "success": false,
  "error": "Invalid data provided",
  "details": {
    "title": ["Title is required"],
    "price": ["Price must be a positive number"]
  }
}
```

## Testing Scenarios

### Unit Tests
```javascript
describe('Admin API', () => {
  test('should require admin role for dashboard access', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Admin access required');
  });

  test('should return dashboard stats for admin', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('totalOrders');
    expect(response.body.data).toHaveProperty('totalRevenue');
  });
});
```

### Integration Tests
```javascript
describe('Admin Order Management', () => {
  test('should complete order verification process', async () => {
    // 1. Get pending orders
    // 2. Verify payment
    // 3. Update order status
    // 4. Check user access granted
  });
});
```

## Common Error Codes

| Status | Error Message | Description |
|--------|---------------|-------------|
| 401 | Unauthorized | No valid token provided |
| 403 | Admin access required | User is not admin |
| 400 | Missing id | Required ID parameter missing |
| 404 | Resource not found | Requested resource doesn't exist |
| 409 | Conflict | Resource already exists or conflict |
| 500 | Internal server error | Server-side error |