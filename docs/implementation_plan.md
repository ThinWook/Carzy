# Implementation Plan — Refactor Giai Đoạn 1

## Mục Tiêu
Cải thiện nền móng của API mà **không thay đổi business logic**, chỉ tập trung vào: bảo mật, consistency và maintainability.

## Phạm Vi Thay Đổi

---

### 1. Cài Winston Logger

#### [MODIFY] [package.json](file:///d:/Carzy/packages/api/package.json)
Thêm `winston` vào dependencies.

---

### 2. Xóa console.log Debug

#### [MODIFY] [vehicleController.js](file:///d:/Carzy/packages/api/src/controllers/vehicleController.js)
Xóa 8 `console.log` debug (bao gồm log Cloudinary config). Giữ lại `console.error` và chuyển sang `logger.error`.

#### [MODIFY] [userController.js](file:///d:/Carzy/packages/api/src/controllers/userController.js)
Xóa 6 `console.log` debug (upload avatar, cover, KYC). Giữ lại `console.error` và chuyển sang `logger.error`.

#### [MODIFY] [userRoutes.js](file:///d:/Carzy/packages/api/src/routes/userRoutes.js)
Xóa `console.log` Cloudinary config (4 dòng) và xóa [logUploadMiddleware](file:///d:/Carzy/packages/api/src/routes/userRoutes.js#58-65) debug (3 console.log bên trong).

#### [MODIFY] [index.js](file:///d:/Carzy/packages/api/src/index.js)
Xóa `console.log` Cloudinary config (lines 58–62).

---

### 3. Tạo Các File Mới

#### [NEW] [logger.js](file:///d:/Carzy/packages/api/src/utils/logger.js)
Winston logger với 2 transport: Console (dev) + silent (prod có thể mở rộng). Dev hiện debug, prod chỉ info trở lên.

#### [NEW] [errors.js](file:///d:/Carzy/packages/api/src/utils/errors.js)
Custom error classes: `AppError`, `AuthError`, `ForbiddenError`, `NotFoundError`, `ConflictError`.

#### [NEW] [errorHandler.js](file:///d:/Carzy/packages/api/src/middleware/errorHandler.js)
Global error handler — bắt tất cả lỗi theo dạng `{ status, message }`. Đăng ký cuối cùng trong [index.js](file:///d:/Carzy/packages/api/src/index.js).

#### [NEW] [validate.js](file:///d:/Carzy/packages/api/src/middleware/validators/validate.js)
Helper middleware: đọc kết quả từ `express-validator` và trả về `422` nếu có lỗi.

#### [NEW] [authValidators.js](file:///d:/Carzy/packages/api/src/middleware/validators/authValidators.js)
Validators cho: [register](file:///d:/Carzy/packages/web/src/contexts/AuthContext.tsx#232-258) (email, password ≥8 ký tự, phone 10-11 số, full_name bắt buộc) và [login](file:///d:/Carzy/packages/web/src/contexts/AuthContext.tsx#184-231) (email, password bắt buộc).

#### [NEW] [vehicleValidators.js](file:///d:/Carzy/packages/api/src/middleware/validators/vehicleValidators.js)
Validators cho [createVehicle](file:///d:/Carzy/packages/api/src/controllers/vehicleController.js#4-104): type đúng enum, price > 0, year hợp lệ, title/make/model bắt buộc.

#### [NEW] [authRoutes.js](file:///d:/Carzy/packages/api/src/routes/authRoutes.js)
Tách 3 auth endpoints (`/login`, `/register`, `/current-user`) ra file riêng, áp dụng validators.

---

### 4. Cập Nhật File Hiện Có

#### [MODIFY] [index.js](file:///d:/Carzy/packages/api/src/index.js)
- Xóa 3 dòng auth routes hardcoded
- Mount `authRoutes` tại `/api/auth`
- Đăng ký `errorHandler` middleware **cuối cùng**
- Thay `console.log`/`console.error` bằng `logger`

#### [MODIFY] [Vehicle.js](file:///d:/Carzy/packages/api/src/models/Vehicle.js)
- Thêm 5 indexes: `{type,status}`, `{make,model}`, `{price}`, `{user,status}`, full-text search `{title,make,model}`
- Chuyển sang `timestamps: true` (xoá pre-save hook timestamp thủ công)

#### [MODIFY] [User.js](file:///d:/Carzy/packages/api/src/models/User.js)
- Chuyển sang `timestamps: true` với `{ createdAt: 'created_at', updatedAt: 'updated_at' }`
- Xóa `created_at`, `updated_at` field và pre-save hook timestamp thủ công

#### [MODIFY] [vehicleRoutes.js](file:///d:/Carzy/packages/api/src/routes/vehicleRoutes.js)
- Xóa `console.error` inline, áp dụng `vehicleValidators` cho POST `/`

#### [MODIFY] [authRoutes.js (mới)/ userRoutes.js](file:///d:/Carzy/packages/api/src/routes/userRoutes.js)
- Xóa `/register` và `/login` khỏi userRoutes (đã chuyển sang authRoutes)

---

## Verification Plan

### Automated Tests
Chạy test suite hiện có (không thay đổi test files):

```bash
# Từ thư mục root d:\Carzy
npm test
```

Expected: tất cả 3 test files (userController, vehicleController, favoriteController) vẫn PASS vì tests dùng mock, không phụ thuộc vào logger hay validator middleware.

### Manual Verification (sau khi chạy `npm run api`)

#### Test 1 — Server khởi động thành công
```bash
cd d:\Carzy && npm run api
# Expected: "Server is running on port 5000" (qua logger, không phải console.log)
# Expected: KHÔNG còn log "Cloudinary Configuration: {...}"
```

#### Test 2 — Validator hoạt động (register với data lỗi)
```
POST http://localhost:5000/api/auth/register
Body: { "email": "khongphailmail", "password": "123" }
Expected response 422:
{
  "status": "validation_error",
  "errors": [
    { "field": "email", "message": "..." },
    { "field": "password", "message": "..." }
  ]
}
```

#### Test 3 — Auth routes vẫn hoạt động (login bình thường)
```
POST http://localhost:5000/api/auth/login
Body: { "email": "user@test.com", "password": "correctpassword" }
Expected: 200 với token (hoặc 401 nếu sai pass — đúng behavior)
```

#### Test 4 — Error handler trả về format chuẩn
```
GET http://localhost:5000/api/vehicles/invalidobjectid
Expected response 500 (hoặc 400):
{ "status": "error", "message": "..." }
```

> [!NOTE]
> Việc thay đổi `timestamps` trong Model (từ manual sang `{ timestamps: true }`) hoàn toàn tương thích với dữ liệu MongoDB hiện có — Mongoose chỉ thay đổi cách nó tự động set giá trị, không migrate data.
