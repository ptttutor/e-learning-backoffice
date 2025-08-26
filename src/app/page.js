import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>ระบบ E-Learning</h1>
      <div style={{ margin: '32px 0' }}>
        <Link href="/courses" style={{ fontWeight: 600, fontSize: 20 }}>
          ดูรายการคอร์สเรียนทั้งหมด
        </Link>
      </div>
      <div style={{ color: '#888' }}>
        สำหรับผู้ดูแลระบบ: เข้าสู่ระบบ admin ที่ <Link href="/admin/login">/admin/login</Link>
      </div>
    </div>
  );
}
