# Authentication API Documentation

## Overview

ระบบ Authentication ใช้ NextAuth.js พร้อมการรองรับ LINE Login และ Credentials Login โดยมี middleware สำหรับการตรวจสอบสิทธิ์และการจัดการ session

## Authentication Endpoints

### 1. NextAuth Endpoints

#### GET/POST `/api/auth/[...nextauth]`
NextAuth.js dynamic route สำหรับจัดการ authentication flow

**Supported Providers:**
- LINE Login (OAuth)
- Credentials (Email/Password)

**Response Format:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "role": "ADMIN | INSTRUCTOR | STUDENT"
  },
  "expires": "ISO 8601 date string"
}
```

### 2. Custom Login Endpoint

#### POST `/api/auth/login`
Custom login endpoint สำหรับ email/password authentication

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400/401):**
```json
{
  "success": false,
  "error": "ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"
}
```

**Validation Rules:**
- Email และ password จำเป็นต้องระบุ
- Email ต้องเป็นรูปแบบที่ถูกต้อง
- Password จะถูก hash ด้วย bcrypt

### 3. Registration Endpoint

#### POST `/api/auth/register`
สมัครสมาชิกใหม่ด้วย email/password

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "สมัครสมาชิกสำเร็จ",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "อีเมลนี้ถูกใช้งานแล้ว"
}
```

**Validation Rules:**
- ทุกฟิลด์จำเป็นต้องระบุ
- Password ต้องมีอย่างน้อย 6 ตัวอักษร
- Password และ confirmPassword ต้องตรงกัน
- Email ต้องเป็นรูปแบบที่ถูกต้อง (RFC 5322)
- Email ต้องไม่ซ้ำกับที่มีอยู่ในระบบ

## Authentication Middleware

### Session Management
- ใช้ JWT strategy สำหรับ session management
- Session จะมี user id, role, และ lineId (ถ้ามี)
- Token จะถูก refresh อัตโนมัติ

### LINE Login Integration
- รองรับ LINE Login ผ่าน OAuth 2.0
- Scope: `profile openid`
- จัดการ user mapping ระหว่าง LINE ID และ User ID ในระบบ
- สร้าง user ใหม่อัตโนมัติถ้ายังไม่มีในระบบ

### Role-Based Access Control
- **ADMIN**: เข้าถึงได้ทุกส่วนของระบบ
- **INSTRUCTOR**: จัดการคอร์สและเนื้อหาของตนเอง
- **STUDENT**: เข้าถึงคอร์สที่ลงทะเบียนแล้ว

## Security Features

### Password Security
- Password hashing ด้วย bcrypt (salt rounds: 12)
- Password validation ขั้นต่ำ 6 ตัวอักษร
- ไม่ส่ง password กลับใน response

### Session Security
- JWT tokens มี expiration time
- Secure cookie settings
- CSRF protection ผ่าน NextAuth.js

### Error Handling
- Generic error messages เพื่อป้องกัน user enumeration
- Proper HTTP status codes
- Logging สำหรับ security events

## Testing Scenarios

### Unit Tests
```javascript
// Test login with valid credentials
describe('POST /api/auth/login', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});

// Test registration validation
describe('POST /api/auth/register', () => {
  test('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
  });
});
```

### Integration Tests
```javascript
// Test LINE login flow
describe('LINE Login Integration', () => {
  test('should create new user on first LINE login', async () => {
    // Mock LINE OAuth response
    const mockLineUser = {
      id: 'line_user_id',
      name: 'LINE User',
      picture: 'https://example.com/avatar.jpg'
    };
    
    // Test user creation and session
    // ...
  });
});
```

### Error Scenarios
- Invalid email format
- Password too short
- Email already exists
- Invalid credentials
- Missing required fields
- LINE OAuth failures
- Database connection errors

## Common Error Codes

| Status | Error Message | Description |
|--------|---------------|-------------|
| 400 | กรุณาระบุอีเมลและรหัสผ่าน | Missing email or password |
| 400 | รูปแบบอีเมลไม่ถูกต้อง | Invalid email format |
| 400 | รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร | Password too short |
| 400 | อีเมลนี้ถูกใช้งานแล้ว | Email already exists |
| 401 | ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง | Invalid credentials |
| 500 | เกิดข้อผิดพลาดในการเข้าสู่ระบบ | Server error |