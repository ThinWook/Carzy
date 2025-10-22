# Used Car Marketplace

Phiên bản: 1.0.0

Mô tả ngắn: Đây là một dự án chợ xe cũ (ô tô, xe máy, xe đạp) dạng monorepo gồm 3 package chính:

- `packages/web` : Frontend (Next.js) cho người dùng (port 3000)
- `packages/admin` : Dashboard quản trị (Next.js) (port 3001)
- `packages/api` : REST API (Express + MongoDB + Socket.IO) (port 5000)
- `packages/shared` : package tiện ích/chung (types, schema, helper)

## Các tính năng chính

- Đăng ký / đăng nhập người dùng (JWT)
- Tin đăng xe: tạo, sửa, xóa, tải ảnh (Cloudinary)
- Tìm kiếm & lọc xe (theo hãng, model, năm, giá...)
- Yêu thích (Favorites)
- Đánh giá (Reviews)
- Thanh toán (Stripe) và xử lý giao dịch
- Thông báo (Notifications)
- Chat thời gian thực giữa người mua và người bán (Socket.IO)
- Dashboard admin để quản lý người dùng, xe, thống kê
- Kết nối dữ liệu xe từ nguồn ngoài (NHTSA / Imagin API) để lấy thông tin và ảnh mẫu

## Kiến trúc & Công nghệ

- Monorepo (npm workspaces)
- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express, MongoDB (mongoose)
- Realtime: Socket.IO
- Lưu ảnh: Cloudinary
- Thanh toán: Stripe
- Test: Jest (có cấu hình smoke tests trong `test/`)

## Yêu cầu (Prerequisites)

- Node.js (phiên bản >= 18 khuyến nghị)
- npm >= 7 (để hỗ trợ workspaces) hoặc dùng Yarn / pnpm nếu bạn chuyển cấu hình
- MongoDB (cục bộ hoặc kết nối Atlas)

## Cấu trúc ports mặc định

- Frontend (web): http://localhost:3000
- Admin dashboard: http://localhost:3001
- API: http://localhost:5000

## Cài đặt và chạy (Development)

1. Clone repository (nếu chưa):

   git clone <repo-url>

2. Cài đặt dependencies ở root (sử dụng npm workspaces):

   npm install

   Lệnh trên sẽ cài dependencies cho tất cả packages trong `packages/*`.

3. Tạo file môi trường cho API

   Vào `packages/api` và tạo file `.env` (dựa theo ví dụ dưới). API dùng `dotenv` và sẽ load file `packages/api/.env`.

   Ví dụ `packages/api/.env`:

   MONGODB*URI=mongodb://localhost:27017/vehicle-marketplace
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=sk_test*...
   STRIPE*WEBHOOK_SECRET=whsec*...
   FRONTEND_URL=http://localhost:3000
   ADMIN_URL=http://localhost:3001
   IMAGIN_CUSTOMER_KEY=hrjavascript-mastery

   Lưu ý: thay giá trị `your_*` bằng giá trị thực tế của bạn.

4. Chạy toàn bộ ứng dụng (dev)

   Ở root repo, chạy:

   npm run dev

   - Lệnh này sẽ chạy song song `web` (Next.js trên 3000), `admin` (Next.js trên 3001) và `api` (Express trên 5000) bằng `concurrently`.

5. Chạy từng package riêng lẻ (nếu cần):

   - API (development):

     cd packages/api
     npm run dev

   - Web (frontend):

     cd packages/web
     npm run dev

   - Admin (dashboard):

     cd packages/admin
     npm run dev

6. Test nhanh (root):

   npm test

## Lệnh hữu ích

- npm run dev — chạy đồng thời web + admin + api
- npm run web — chạy frontend (packages/web)
- npm run admin — chạy admin (packages/admin)
- npm run api — chạy api (packages/api)
- npm run clean — xóa node_modules trong root và packages
- npm run clean-reinstall — clean rồi cài lại (force)

## Cài đặt Cloudinary và Stripe

- Cloudinary: đăng ký tài khoản, lấy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, sau đó điền vào `packages/api/.env`.
- Stripe: lấy `STRIPE_SECRET_KEY` để tạo payment intents; nếu sử dụng webhook cần `STRIPE_WEBHOOK_SECRET` và cấu hình endpoint trên Stripe dashboard.

## Database seeding / scripts

- Trong `packages/api/src/seed` có mã seed dữ liệu (nếu muốn import sample data). Hiện repo không có script `npm run seed` mặc định; bạn có thể tạo script trong `packages/api/package.json` hoặc chạy file seed trực tiếp:

  node packages/api/src/seed/index.js

  (lưu ý: đảm bảo `MONGODB_URI` đã được cấu hình và node_modules đã cài trong `packages/api`)

## Triển khai (ngắn gọn)

- Build Next.js cho production:

  cd packages/web && npm run build && npm run start
  cd packages/admin && npm run build && npm run start

- Backend: triển khai `packages/api` vào server (PM2, Docker, hoặc platform như Heroku/Vercel/Render). Đừng quên set biến môi trường trên môi trường production.

## Lưu ý & Troubleshooting

- Nếu gặp lỗi CORS hoặc websocket không kết nối, kiểm tra `FRONTEND_URL` và `ADMIN_URL` trong `.env` và kiểm tra `NODE_ENV`.
- Nếu dùng Windows PowerShell, các lệnh `cd` và `npm run` vẫn hoạt động như bình thường.
- Nếu gặp vấn đề với workspaces: đảm bảo npm >= 7. Hoặc cài dependencies từng package bằng `cd packages/api && npm install`...

## Gợi ý phát triển tiếp

- Thêm script `seed` trong `packages/api/package.json` để dễ chạy dữ liệu mẫu
- Thêm file `.env.example` trong `packages/api` để tiện cấu hình
- Thêm Dockerfile / docker-compose cho môi trường dev/release