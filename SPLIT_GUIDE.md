# Tách monorepo thành 3 dự án độc lập (web, admin, api)

Tài liệu này hướng dẫn bạn tách repo hiện tại thành 3 dự án riêng: frontend web (Next.js), admin (Next.js), và API (Express). Dự án hiện tại vốn đã tách thư mục nên việc tách rất đơn giản.

## Lựa chọn 1: Giữ monorepo, chạy từng phần độc lập

- Chạy web: `npm run web`
- Chạy admin: `npm run admin`
- Chạy api: `npm run api`

Gợi ý: Tránh dùng `npm run dev` nếu môi trường DB chưa sẵn sàng vì lệnh này chạy cả 3 dịch vụ cùng lúc và có thể gây lỗi (Exit Code 1).

## Lựa chọn 2: Tách thành 3 dự án riêng (đề xuất khi deploy độc lập)

Các thư mục nguồn:

- API: `packages/api`
- Web: `packages/web`
- Admin: `packages/admin`

### Bước 1 – Sao chép mã nguồn sang 3 thư mục mới (Windows PowerShell)

Bạn có thể tạo 3 thư mục cùng cấp với repo hiện tại (ví dụ đặt cạnh `used-car-marketplace`).

Ví dụ (hãy cập nhật đường dẫn đích theo ý bạn):

```powershell
# Thay đổi đường dẫn đích theo nhu cầu
$root = "D:\\"
$src  = "D:\\used-car-marketplace\\packages"

Copy-Item "$src\\api"   -Destination "$root\\used-car-api"   -Recurse -Force
Copy-Item "$src\\web"   -Destination "$root\\used-car-web"   -Recurse -Force
Copy-Item "$src\\admin" -Destination "$root\\used-car-admin" -Recurse -Force
```

Lưu ý: Nếu trong các thư mục có `.next/` hoặc `node_modules/`, bạn có thể xóa để cài lại sạch.

### Bước 2 – Khởi tạo Git (tùy chọn, nếu tạo 3 repo mới)

Trong mỗi thư mục mới, chạy:

```powershell
cd D:\\used-car-api;   git init; git add .; git commit -m "init api"
cd D:\\used-car-web;   git init; git add .; git commit -m "init web"
cd D:\\used-car-admin; git init; git add .; git commit -m "init admin"
```

Sau đó gắn remote riêng rồi `git push -u origin main` (tùy repo của bạn).

### Bước 3 – Cấu hình biến môi trường

- API (`.env`): đã có sẵn `PORT=5000`, `MONGODB_URI=...`. Nếu chạy production, thêm:
  - `FRONTEND_URL=https://your-web-domain`
  - `ADMIN_URL=https://your-admin-domain`
- Web (`.env.local`):
  - `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (đổi sang domain khi deploy)
- Admin (`.env.local`):
  - `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (đổi sang domain khi deploy)

### Bước 4 – Cài dependencies và chạy

Trong từng dự án:

```powershell
# API
cd D:\\used-car-api
npm install
npm run dev   # hoặc npm start

# Web
cd D:\\used-car-web
npm install
npm run dev   # mở http://localhost:3000

# Admin
cd D:\\used-car-admin
npm install
npm run dev   # mở http://localhost:3001
```

Đối với API, cần chạy MongoDB cục bộ (theo `MONGODB_URI`) hoặc cập nhật connection string phù hợp.

### Bước 5 – Kiểm tra CORS + kết nối

- Mặc định API cho phép origin `http://localhost:3000` và `http://localhost:3001` khi `NODE_ENV=development`.
- Khi deploy production, đặt `NODE_ENV=production` và điền `FRONTEND_URL`, `ADMIN_URL` trong `.env` của API để bật CORS đúng domain.

## Ghi chú quan trọng

- Thư mục `packages/shared` hiện không được import ở đâu, nên không cần mang sang nếu bạn không dùng.
- `public/` ở root chỉ chứa logo dùng chung; Web/Admin đã có `public/` riêng, nên không bắt buộc chép.
- Tests ở `test/` thuộc monorepo; nếu muốn tách tests, bạn nên tạo test riêng cho từng repo mới.

## Sự cố thường gặp

- `npm run dev` ở monorepo fail: thường do thiếu MongoDB/bộ env khi chạy 3 dịch vụ cùng lúc. Hãy chạy từng dịch vụ riêng hoặc tách repo như hướng dẫn.
- Port xung đột: Web dùng 3000, Admin 3001, API 5000. Đổi port trong script nếu cần.

---

Cần mình tự động sao chép thành 3 thư mục và dọn `.next/` + `node_modules/` giúp bạn không? Mình có thể chạy các lệnh PowerShell ngay trong workspace này theo đường dẫn bạn muốn.
