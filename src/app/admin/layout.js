"use client";

const menuItems = [
  {
    key: "/admin/dashboard",
    label: "📊 แดชบอร์ด",
    href: "/admin/dashboard",
  },
  {
    key: "/admin/orders",
    label: "📋 คำสั่งซื้อ",
    href: "/admin/orders",
  },
  {
    key: "/admin/shipping",
    label: "🚚 การจัดส่ง",
    href: "/admin/shipping",
  },
  {
    key: "/admin/courses",
    label: "🎓 คอร์สเรียน",
    href: "/admin/courses",
  },
  {
    key: "/admin/categories",
    label: "📂 หมวดหมู่คอร์ส",
    href: "/admin/categories",
  },
  {
    key: "/admin/ebooks",
    label: "📚 eBooks",
    href: "/admin/ebooks",
  },
  {
    key: "/admin/ebook-categories",
    label: "📖 หมวดหมู่ eBook",
    href: "/admin/ebook-categories",
  },
  {
    key: "/admin/posts",
    label: "📝 โพสต์",
    href: "/admin/posts",
  },
  {
    key: "/admin/post-types",
    label: "🏷️ ประเภทโพสต์",
    href: "/admin/post-types",
  },
  {
    key: "/admin/users",
    label: "👥 ผู้ใช้",
    href: "/admin/users",
  },
];

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#222",
          color: "#fff",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "22px",
            padding: "24px 16px",
            borderBottom: "1px solid #333",
            letterSpacing: "1px",
          }}
        >
          Admin Panel
        </div>

        <nav style={{ padding: "16px 0" }}>
          {menuItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              style={{
                display: "block",
                padding: "12px 24px",
                color: "#fff",
                textDecoration: "none",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#444";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "220px",
          backgroundColor: "#f7f7f7",
          minHeight: "100vh",
          width: "calc(100% - 220px)",
          padding: "0",
        }}
      >
        {children}
      </div>
    </div>
  );
}
