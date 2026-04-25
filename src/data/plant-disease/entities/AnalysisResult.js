export function createSuggestedProduct(data = {}) {
  return {
    MaSanPham: data.MaSanPham || "",
    TenSanPham: data.TenSanPham || "",
    MoTa: data.MoTa || "",
    HuongDan: data.HuongDan || "",
    Gia: data.Gia || null,
    SoLuongCo: data.SoLuongCo || 0,
    imageUrl: data.imageUrl || "",
    actual_price: data.actual_price || 0,
    detailed_markdown: data.detailed_markdown || ""
  };
}