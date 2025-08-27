# ระบบจัดการโพสต์ (Post Management System)

## ภาพรวม

ระบบจัดการโพสต์ถูกออกแบบมาเพื่อรองรับการสร้างและจัดการเนื้อหาต่างๆ ในแพลตฟอร์ม e-learning

## โครงสร้างฐานข้อมูล

### PostType (ประเภทโพสต์)

- `id`: รหัสเฉพาะ (UUID)
- `name`: ชื่อประเภทโพสต์ (เช่น บทความ, ข่าวสาร, บทเรียน)
- `description`: คำอธิบายประเภทโพสต์
- `isActive`: สถานะการใช้งาน
- `createdAt`, `updatedAt`: วันที่สร้างและแก้ไข

### Post (โพสต์)

- `id`: รหัสเฉพาะ (UUID)
- `title`: หัวข้อโพสต์
- `content`: เนื้อหาโพสต์
- `excerpt`: สรุปโพสต์
- `imageUrl`: URL รูปภาพประกอบ (Desktop)
- `imageUrlMobileMode`: URL รูปภาพประกอบ (Mobile)
- `slug`: URL slug สำหรับ SEO
- `isActive`: สถานะการใช้งาน
- `isFeatured`: โพสต์แนะนำ
- `publishedAt`: วันที่เผยแพร่
- `authorId`: รหัสผู้เขียน (เชื่อมโยงกับ User)
- `postTypeId`: รหัสประเภทโพสต์
- `createdAt`, `updatedAt`: วันที่สร้างและแก้ไข

### Tag (แท็ก)

- `id`: รหัสเฉพาะ (UUID)
- `name`: ชื่อแท็ก
- `slug`: URL slug
- `color`: สีแท็ก (hex code)
- `isActive`: สถานะการใช้งาน
- `createdAt`: วันที่สร้าง

### PostTag (ความสัมพันธ์ระหว่างโพสต์และแท็ก)

- `id`: รหัสเฉพาะ (UUID)
- `postId`: รหัสโพสต์
- `tagId`: รหัสแท็ก

## ประเภทโพสต์เริ่มต้น

1. **บทความ** - บทความทั่วไป
2. **ข่าวสาร** - ข่าวสารและประกาศ
3. **บทเรียน** - เนื้อหาการเรียนการสอน
4. **เคล็ดลับ** - เคล็ดลับและแนวทางปฏิบัติ

## แท็กเริ่มต้น

- JavaScript (#f7df1e)
- React (#61dafb)
- Next.js (#000000)
- CSS (#1572b6)
- Design (#ff6b6b)
- Tutorial (#4ecdc4)

## ฟีเจอร์หลัก

### การจัดการโพสต์

- สร้าง แก้ไข ลบโพสต์
- กำหนดประเภทโพสต์
- เพิ่มแท็กให้โพสต์
- อัปโหลดรูปภาพประกอบ
- กำหนดสถานะการเผยแพร่

### การจัดหมวดหมู่

- จัดกลุ่มโพสต์ตามประเภท
- ใช้แท็กในการจัดหมวดหมู่
- ค้นหาโพสต์ตามแท็ก

### การแสดงผล

- โพสต์แนะนำ (Featured Posts)
- เรียงลำดับตามวันที่
- กรองตามประเภทและแท็ก

## การใช้งาน API

### ดึงโพสต์ทั้งหมด

```javascript
const posts = await prisma.post.findMany({
  include: {
    author: true,
    postType: true,
    tags: {
      include: {
        tag: true,
      },
    },
  },
  where: {
    isActive: true,
    publishedAt: {
      lte: new Date(),
    },
  },
  orderBy: {
    publishedAt: "desc",
  },
});
```

### ดึงโพสต์ตามประเภท

```javascript
const postsByType = await prisma.post.findMany({
  where: {
    postType: {
      name: "บทความ",
    },
    isActive: true,
  },
  include: {
    author: true,
    tags: {
      include: {
        tag: true,
      },
    },
  },
});
```

### ดึงโพสต์ตามแท็ก

```javascript
const postsByTag = await prisma.post.findMany({
  where: {
    tags: {
      some: {
        tag: {
          slug: "javascript",
        },
      },
    },
    isActive: true,
  },
  include: {
    author: true,
    postType: true,
    tags: {
      include: {
        tag: true,
      },
    },
  },
});
```

## การขยายระบบ

ระบบนี้สามารถขยายได้ในอนาคต เช่น:

- เพิ่มระบบความคิดเห็น
- เพิ่มระบบการให้คะแนน
- เพิ่มระบบการแชร์
- เพิ่มระบบการแจ้งเตือน
- เพิ่มระบบ SEO metadata
