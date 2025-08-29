"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        const response = await fetch(`/api/ebooks/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setEbook(result.data);
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error("Error fetching ebook:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEbook();
    }
  }, [params.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} style={{ color: "#ffc107" }}>
          ★
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" style={{ color: "#ffc107" }}>
          ☆
        </span>
      );
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: "#e9ecef" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handlePurchase = () => {
    // ไปหน้า purchase พร้อมข้อมูล ebook
    router.push(`/purchase?type=ebook&id=${ebook.id}`);
  };

  const handlePreview = () => {
    if (ebook.previewUrl) {
      window.open(ebook.previewUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <div>กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2>ไม่พบหนังสือที่ต้องการ</h2>
          <p style={{ color: "#6c757d", marginBottom: "24px" }}>{error}</p>
          <Link
            href="/ebooks"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #dee2e6",
          padding: "16px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <nav style={{ fontSize: "14px", color: "#6c757d" }}>
            <Link
              href="/ebooks"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              eBooks
            </Link>
            {ebook.category && (
              <>
                <span style={{ margin: "0 8px" }}>›</span>
                <span>{ebook.category.name}</span>
              </>
            )}
            <span style={{ margin: "0 8px" }}>›</span>
            <span>{ebook.title}</span>
          </nav>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Left Column - Cover & Actions */}
          <div>
            <div
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "sticky",
                top: "24px",
              }}
            >
              {/* Cover Image */}
              <div
                style={{
                  height: "400px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  overflow: "hidden",
                }}
              >
                {ebook.coverImageUrl ? (
                  <img
                    src={ebook.coverImageUrl}
                    alt={ebook.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: ebook.coverImageUrl ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    fontSize: "96px",
                    color: "#dee2e6",
                  }}
                >
                  📖
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "24px", textAlign: "center" }}>
                {ebook.discountPrice ? (
                  <div>
                    <div
                      style={{
                        textDecoration: "line-through",
                        color: "#6c757d",
                        fontSize: "18px",
                        marginBottom: "4px",
                      }}
                    >
                      {formatPrice(ebook.price)}
                    </div>
                    <div
                      style={{
                        color: "#dc3545",
                        fontSize: "32px",
                        fontWeight: "bold",
                      }}
                    >
                      {formatPrice(ebook.discountPrice)}
                    </div>
                    <div
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        display: "inline-block",
                        marginTop: "8px",
                      }}
                    >
                      ประหยัด {formatPrice(ebook.price - ebook.discountPrice)}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#28a745",
                    }}
                  >
                    {formatPrice(ebook.price)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  onClick={handlePurchase}
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#218838")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#28a745")
                  }
                >
                  🛒 ซื้อเลย
                </button>

                {ebook.previewUrl && (
                  <button
                    onClick={handlePreview}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "white",
                      color: "#007bff",
                      border: "2px solid #007bff",
                      borderRadius: "6px",
                      fontSize: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#007bff";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "white";
                      e.target.style.color = "#007bff";
                    }}
                  >
                    👁️ ดูตัวอย่าง
                  </button>
                )}
              </div>

              {/* Book Info */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px 0",
                  borderTop: "1px solid #dee2e6",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>รูปแบบ:</strong>
                    <br />
                    <span style={{ color: "#6c757d" }}>{ebook.format}</span>
                  </div>
                  {ebook.pageCount && (
                    <div>
                      <strong>จำนวนหน้า:</strong>
                      <br />
                      <span style={{ color: "#6c757d" }}>
                        {ebook.pageCount} หน้า
                      </span>
                    </div>
                  )}
                  <div>
                    <strong>ภาษา:</strong>
                    <br />
                    <span style={{ color: "#6c757d" }}>
                      {ebook.language === "th" ? "ไทย" : ebook.language}
                    </span>
                  </div>
                  {ebook.isbn && (
                    <div>
                      <strong>ISBN:</strong>
                      <br />
                      <span style={{ color: "#6c757d" }}>{ebook.isbn}</span>
                    </div>
                  )}
                  {ebook.isPhysical && (
                    <>
                      {ebook.weight && (
                        <div>
                          <strong>น้ำหนัก:</strong>
                          <br />
                          <span style={{ color: "#6c757d" }}>
                            {ebook.weight} kg
                          </span>
                        </div>
                      )}
                      {ebook.dimensions && (
                        <div>
                          <strong>ขนาด:</strong>
                          <br />
                          <span style={{ color: "#6c757d" }}>
                            {ebook.dimensions}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div
              style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {/* Title & Author */}
              <div style={{ marginBottom: "24px" }}>
                <h1
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: "1.2",
                  }}
                >
                  {ebook.title}
                  {ebook.isFeatured && (
                    <span
                      style={{
                        backgroundColor: "#ffc107",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        marginLeft: "12px",
                      }}
                    >
                      ⭐ แนะนำ
                    </span>
                  )}
                </h1>

                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "18px",
                    color: "#6c757d",
                  }}
                >
                  โดย <strong>{ebook.author}</strong>
                </p>

                {ebook.category && (
                  <div style={{ marginBottom: "16px" }}>
                    <Link
                      href={`/ebooks?category=${ebook.category.id}`}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#e9ecef",
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "14px",
                        color: "#495057",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#dee2e6")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#e9ecef")
                      }
                    >
                      📂 {ebook.category.name}
                    </Link>
                  </div>
                )}

                {/* Rating */}
                {ebook.averageRating > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ fontSize: "18px" }}>
                      {renderStars(ebook.averageRating)}
                    </div>
                    <span style={{ fontSize: "16px", color: "#6c757d" }}>
                      {ebook.averageRating.toFixed(1)} ({ebook._count.reviews}{" "}
                      รีวิว)
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {ebook.description && (
                <div style={{ marginBottom: "32px" }}>
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    เกี่ยวกับหนังสือเล่มนี้
                  </h3>
                  <div
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#495057",
                    }}
                  >
                    {showFullDescription || ebook.description.length <= 300 ? (
                      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
                        {ebook.description}
                      </p>
                    ) : (
                      <>
                        <p style={{ margin: 0, whiteSpace: "pre-line" }}>
                          {ebook.description.substring(0, 300)}...
                        </p>
                        <button
                          onClick={() => setShowFullDescription(true)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#007bff",
                            cursor: "pointer",
                            fontSize: "16px",
                            marginTop: "8px",
                            textDecoration: "underline",
                          }}
                        >
                          อ่านเพิ่มเติม
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {ebook.reviews && ebook.reviews.length > 0 && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 24px 0",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    รีวิวจากผู้อ่าน ({ebook.reviews.length})
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {ebook.reviews.slice(0, 5).map((review, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "16px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          borderLeft: "4px solid #007bff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <strong>{review.user.name}</strong>
                          <div>{renderStars(review.rating)}</div>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#495057",
                            lineHeight: "1.5",
                          }}
                        >
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>

                  {ebook.reviews.length > 5 && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "16px",
                        color: "#6c757d",
                      }}
                    >
                      และอีก {ebook.reviews.length - 5} รีวิว...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
