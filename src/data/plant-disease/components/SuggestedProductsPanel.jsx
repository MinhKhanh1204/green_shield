import React from "react";

export default function SuggestedProductsPanel({ result }) {

  if (!result || !result.suggested_products || result.suggested_products.length === 0) {
    return null;
  }

  return (
    <div
      className="suggested-products-wrapper"
      style={{
        padding: "0 24px 60px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}
    >

      <style>
        {`
          .product-card-premium:hover {
            transform: translateY(-4px);
            border-color: rgba(74, 222, 128, 0.5) !important;
          }
        `}
      </style>

      <div
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#fff",
          marginBottom: "2.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px"
        }}
      >

        <div
          style={{
            background: "var(--success)",
            height: "4px",
            width: "60px",
            borderRadius: "10px",
            marginBottom: "5px"
          }}
        />

        <span style={{ color: "var(--success)" }}>
          Gợi Ý Phân Bón & Dinh Dưỡng Duy Trì
        </span>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {result.suggested_products.map((product) => {

          return (

            <div
              key={product.MaSanPham}
              className="product-card-premium"
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                overflow: "hidden",
                width: "100%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease"
              }}
            >

              {/* IMAGE */}

              <div
                style={{
                  width: "300px",
                  minWidth: "300px",
                  background: "#fff",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: "1px solid rgba(255,255,255,0.05)"
                }}
              >

                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.TenSanPham}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      objectFit: "contain"
                    }}
                  />
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    Chưa có hình ảnh
                  </div>
                )}

              </div>

              {/* INFO */}

              <div
                style={{
                  padding: "30px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "16px"
                }}
              >

                <div style={{ display: "flex", gap: "15px" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", width: "130px" }}>
                    Tên sản phẩm:
                  </span>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                      color: "var(--success)"
                    }}
                  >
                    {product.TenSanPham}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", width: "130px" }}>
                    Mô tả:
                  </span>
                  <span style={{ color: "#cbd5e1" }}>
                    {product.MoTa || "Đang cập nhật"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", width: "130px" }}>
                    Giá:
                  </span>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#fbbf24"
                    }}
                  >
                    {product.Gia
                      ? `${parseInt(product.Gia).toLocaleString()} VNĐ`
                      : "Đang cập nhật"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", width: "130px" }}>
                    Số lượng có:
                  </span>
                  <span style={{ color: "#fff" }}>
                    {product.SoLuongCo ?? "Hết hàng"}
                  </span>
                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}