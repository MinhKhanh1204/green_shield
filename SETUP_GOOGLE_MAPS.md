# Thiết lập Google Maps API để map chạy đúng

Nếu bạn thấy lỗi **"Trang này không thể tải Google Maps đúng cách"** hoặc watermark **"For development purposes only"**, làm lần lượt các bước sau trong Google Cloud Console.

## 1. Bật Billing (bắt buộc)

Google yêu cầu **gắn tài khoản thanh toán** cho project (có free credit, không nhất thiết bị trừ tiền khi dùng ít).

- Vào [Google Cloud Console](https://console.cloud.google.com/)
- Chọn đúng **project** (góc trên bên trái)
- Vào **Billing** (menu ☰ → Billing)  
  Hoặc: [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing)
- Nếu thấy **"Link a billing account"** → bấm và chọn/ tạo billing account, gắn vào project

## 2. Bật Maps JavaScript API

- Vào **APIs & Services** → **Library**:  
  [https://console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)
- Tìm **"Maps JavaScript API"** → bấm **Enable**
- (Tùy chọn) Tìm **"Street View Static API"** nếu dùng Street View → bấm **Enable**

## 3. Kiểm tra API key

- Vào **APIs & Services** → **Credentials**:  
  [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- Mở API key bạn đang dùng (hoặc tạo mới)
- **Application restrictions** (nếu bật):
  - **Quan trọng:** Chọn **"HTTP referrers (websites)"** — *không* chọn "IP addresses".  
    Ô "Add IP address" chỉ dùng cho địa chỉ IP (CIDR), không nhập URL vào đó.
  - Chọn **HTTP referrers** → bấm **"Add an item"** (hoặc Add website) rồi nhập:
    - `http://localhost:*`
    - `http://127.0.0.1:*`
    - (Sau này thêm domain production, ví dụ: `https://yourdomain.com/*`)
- **API restrictions**:
  - Chọn **Restrict key**
  - Chọn **Maps JavaScript API** (và Street View nếu dùng)

## 4. Trong project (Green Shield)

- API key đã có trong file `green_shield/.env`:
  ```env
  VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key...
  ```
- **Quan trọng:** Sau khi sửa `.env`, cần **tắt và chạy lại** dev server:
  ```bash
  cd green_shield
  npm run dev
  ```

## Checklist nhanh

- [ ] Project đã gắn Billing
- [ ] Đã bật **Maps JavaScript API**
- [ ] API key đúng, không bị restrict domain (hoặc đã thêm localhost)
- [ ] Đã restart `npm run dev` sau khi sửa `.env`

Sau khi xong, tải lại trang (F5) để kiểm tra map.
