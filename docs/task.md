# Task: Refactor Giai Đoạn 1 — Nền Móng

## Mục tiêu
Thực hiện các cải thiện "nền móng" với rủi ro thấp, hiệu quả ngay lập tức.

---

## Danh Sách Công Việc

### 1. Cài đặt dependencies mới
- [x] Cài `winston` (logger)
- [x] Kiểm tra `express-validator` đã có chưa (đã có trong package.json)

### 2. Xóa console.log debug
- [x] [packages/api/src/controllers/vehicleController.js](file:///d:/Carzy/packages/api/src/controllers/vehicleController.js)
- [x] [packages/api/src/controllers/userController.js](file:///d:/Carzy/packages/api/src/controllers/userController.js)
- [x] [packages/api/src/index.js](file:///d:/Carzy/packages/api/src/index.js) (console.log Cloudinary config)

### 3. Tạo Winston Logger
- [x] Tạo [packages/api/src/utils/logger.js](file:///d:/Carzy/packages/api/src/utils/logger.js)
- [x] Thay thế console.log còn lại bằng logger trong controllers

### 4. Thêm Custom Error Classes
- [x] Tạo [packages/api/src/utils/errors.js](file:///d:/Carzy/packages/api/src/utils/errors.js) (AppError, AuthError, NotFoundError, ForbiddenError, ConflictError, ValidationError)

### 5. Thêm Global Error Handler
- [x] Tạo [packages/api/src/middleware/errorHandler.js](file:///d:/Carzy/packages/api/src/middleware/errorHandler.js)
- [x] Đăng ký errorHandler trong [index.js](file:///d:/Carzy/packages/api/src/index.js)

### 6. Kích hoạt express-validator
- [x] Tạo [packages/api/src/middleware/validators/authValidators.js](file:///d:/Carzy/packages/api/src/middleware/validators/authValidators.js)
- [x] Tạo [packages/api/src/middleware/validators/vehicleValidators.js](file:///d:/Carzy/packages/api/src/middleware/validators/vehicleValidators.js)
- [x] Tạo [packages/api/src/middleware/validators/validate.js](file:///d:/Carzy/packages/api/src/middleware/validators/validate.js) (helper)

### 7. Tách auth routes
- [x] Tạo [packages/api/src/routes/authRoutes.js](file:///d:/Carzy/packages/api/src/routes/authRoutes.js)
- [x] Xóa auth routes khỏi [index.js](file:///d:/Carzy/packages/api/src/index.js), mount qua `app.use('/api/auth', authRoutes)`

### 8. Thêm MongoDB indexes
- [x] Cập nhật [packages/api/src/models/Vehicle.js](file:///d:/Carzy/packages/api/src/models/Vehicle.js) — thêm indexes
- [x] Cập nhật [packages/api/src/models/User.js](file:///d:/Carzy/packages/api/src/models/User.js) — dùng timestamps option

### 9. Áp dụng validators vào routes
- [x] Cập nhật [packages/api/src/routes/userRoutes.js](file:///d:/Carzy/packages/api/src/routes/userRoutes.js)
- [x] Cập nhật [packages/api/src/routes/vehicleRoutes.js](file:///d:/Carzy/packages/api/src/routes/vehicleRoutes.js)
- [x] Cập nhật [packages/api/src/routes/authRoutes.js](file:///d:/Carzy/packages/api/src/routes/authRoutes.js)

### 10. Kiểm tra và test
- [x] Chạy `npm run api` kiểm tra server khởi động không lỗi
- [x] Test các endpoint quan trọng
