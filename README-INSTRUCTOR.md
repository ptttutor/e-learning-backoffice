# Instructor Dashboard

## 📊 ภาพรวม

Dashboard สำหรับครูผู้สอน แสดงยอดขายและสถิติของคอร์สที่ตนเองสอนเท่านั้น

## 🚀 คุณสมบัติ

### 1. **สถิติภาพรวม**
- 💰 รายได้รวม (จากคอร์สของตนเอง)
- 🛒 คำสั่งซื้อสำเร็จ
- 📚 จำนวนคอร์สทั้งหมด
- 👥 จำนวนผู้เรียน (unique users)

### 2. **ยอดขายแยกตามคอร์ส**
- แสดงรายละเอียดแต่ละคอร์ส
- จำนวนที่ขาย
- รายได้รวมต่อคอร์ส
- เรียงตามยอดขายมากไปน้อย

### 3. **รายการขายล่าสุด**
- แสดง 100 รายการล่าสุด
- ชื่อคอร์ส
- ผู้ซื้อ
- ยอดขาย
- วันที่ชำระเงิน

## 🔐 สิทธิ์การเข้าถึง

- **INSTRUCTOR**: ดูได้เฉพาะคอร์สของตนเอง
- **ADMIN**: ดูได้ทุกคอร์ส (สามารถเข้าหน้า instructor dashboard ได้)

## 📁 โครงสร้างไฟล์

```
src/
├── app/
│   ├── instructor/
│   │   ├── layout.js              # Layout + Auth Guard
│   │   └── dashboard/
│   │       └── page.js             # หน้า Dashboard
│   └── api/
│       └── instructor/
│           ├── dashboard/
│           │   ├── stats/          # API สถิติภาพรวม
│           │   └── course-sales/   # API ยอดขายแยกคอร์ส
│           └── orders/             # API รายการขาย
├── components/
│   └── instructor/
│       └── InstructorDashboardOverview.js  # Component หลัก
└── hooks/
    └── useInstructorDashboard.js  # Custom hooks
```

## 🔄 API Endpoints

### 1. `/api/instructor/dashboard/stats`
**Query Parameters:**
- `period` (optional): จำนวนวัน (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "completedOrders": 8,
    "pendingOrders": 2,
    "totalRevenue": 44800,
    "courseRevenue": 44800,
    "averageOrderValue": 5600,
    "totalCourses": 5,
    "totalUsers": 8,
    "newUsersThisPeriod": 3
  }
}
```

### 2. `/api/instructor/dashboard/course-sales`
**Query Parameters:**
- `period` (optional): จำนวนวัน (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "...",
      "courseName": "คอร์สฟิสิกส์ A LEVEL",
      "price": 5600,
      "salesCount": 8,
      "revenue": 44800
    }
  ]
}
```

### 3. `/api/instructor/orders`
**Query Parameters:**
- `limit` (optional): จำนวนรายการ (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "status": "COMPLETED",
      "total": 5600,
      "user": { "name": "...", "email": "..." },
      "payment": { "amount": 5600, "paidAt": "..." },
      "items": [...]
    }
  ]
}
```

## 💻 การใช้งาน

### Login Redirect
เมื่อ user ที่มี role = `INSTRUCTOR` login สำเร็จ จะถูก redirect ไปที่:
```
/instructor/dashboard
```

### เปลี่ยนช่วงเวลา
ใช้ dropdown ที่มุมขวาบนเพื่อเลือกช่วงเวลา:
- 7 วันที่แล้ว
- 30 วันที่แล้ว (default)
- 90 วันที่แล้ว
- 1 ปีที่แล้ว

## 🔍 การนับยอดขาย

ระบบนับจาก **OrderItem** ที่:
1. `itemType = "COURSE"`
2. `itemId` ตรงกับ courses ที่ instructor สอน
3. `order.status = "COMPLETED"`
4. `order.payment.status = "COMPLETED"`

## ⚠️ หมายเหตุ

- Dashboard นี้แสดงเฉพาะคอร์สที่ `course.instructorId = user.id`
- ข้อมูล real-time อัปเดตตาม period ที่เลือก
- ต้อง login ด้วย account ที่มี role = `INSTRUCTOR` หรือ `ADMIN`

## 🎯 ตัวอย่างการใช้งาน

1. **Login** ด้วย instructor account
2. ระบบจะ redirect ไปที่ `/instructor/dashboard` อัตโนมัติ
3. ดูสถิติและยอดขายของคอร์สตนเอง
4. เปลี่ยน period เพื่อดูข้อมูลในช่วงเวลาที่ต้องการ
