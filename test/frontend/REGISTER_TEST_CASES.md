# Test Cases - Register Page UI Testing

## Tổng quan

File này mô tả chi tiết tất cả các test case cho trang đăng ký (Register Page) sử dụng Puppeteer và Jest.

**Test File**: `test/frontend/register-complete.ui.test.js`

**Tổng số test cases**: 10 test cases chính + 9 test cases bổ sung

---

## Test Cases Chính

### TC01 - Tạo tài khoản thành công ✅

**Mục đích**: Kiểm tra quy trình đăng ký thành công với đầy đủ thông tin hợp lệ

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

```javascript
{
  full_name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone_number: "0901234567",
  password: "Password123",
  confirm_password: "Password123",
  address: "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập đầy đủ thông tin vào các trường
3. Click nút "Đăng ký"
4. Chờ API response (mock 200 OK)

**Kết quả mong đợi**:

- ✅ Hiển thị toast message "Tạo tài khoản thành công" hoặc "Đăng ký thành công"
- ✅ Chuyển hướng đến trang `/auth/login`
- ✅ Không có lỗi validation

---

### TC02 - Thiếu email ❌

**Mục đích**: Kiểm tra validation khi không nhập email

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Điền đầy đủ tất cả các trường NGOẠI TRỪ email (để trống)

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập thông tin vào tất cả các trường trừ email
3. Click nút "Đăng ký"

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Email là bắt buộc" hoặc "Thiếu email"
- ❌ Form không được submit
- ❌ Không chuyển trang

---

### TC03 - Thiếu mật khẩu ❌

**Mục đích**: Kiểm tra validation khi không nhập mật khẩu

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Điền đầy đủ tất cả các trường NGOẠI TRỪ password và confirm_password (để trống)

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập thông tin vào tất cả các trường trừ password
3. Click nút "Đăng ký"

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Mật khẩu là bắt buộc" hoặc "Thiếu mật khẩu"
- ❌ Form không được submit
- ❌ Không chuyển trang

---

### TC04 - Sai định dạng email ❌

**Mục đích**: Kiểm tra validation định dạng email

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Email không hợp lệ: `invalid-email-format`, `invalidemail.com`, `invalid@`

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập email không đúng định dạng
3. Điền các trường còn lại
4. Click nút "Đăng ký"

**Test scenarios**:

- Email không có @
- Email thiếu domain
- Email sai format hoàn toàn

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Email không hợp lệ" hoặc "Sai định dạng email"
- ❌ Form không được submit

---

### TC05 - Mật khẩu yếu ❌

**Mục đích**: Kiểm tra validation độ mạnh mật khẩu (tối thiểu 6 ký tự)

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Mật khẩu ngắn: `123` (3 ký tự), `12345` (5 ký tự)

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập mật khẩu ngắn hơn 6 ký tự
3. Điền các trường còn lại
4. Click nút "Đăng ký"

**Test scenarios**:

- Password 3 ký tự
- Password 5 ký tự (boundary test)
- Password 6 ký tự (boundary test - should pass)

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Mật khẩu phải có ít nhất 6 ký tự" hoặc "Mật khẩu yếu"
- ❌ Form không được submit
- ✅ Password 6 ký tự không báo lỗi về độ dài

---

### TC06 - Email đã tồn tại ❌

**Mục đích**: Kiểm tra xử lý khi đăng ký với email đã được sử dụng

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ
- Mock API response 409 Conflict

**Dữ liệu đầu vào**:

- Email đã tồn tại: `existing@example.com`

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập thông tin hợp lệ với email đã tồn tại
3. Click nút "Đăng ký"
4. API trả về status 409

**Kết quả mong đợi**:

- ❌ Hiển thị toast message: "Email đã tồn tại"
- ❌ Không chuyển trang
- ⚠️ Form vẫn hiển thị để người dùng sửa thông tin

---

### TC07 - Thiếu địa chỉ ❌

**Mục đích**: Kiểm tra validation khi không nhập địa chỉ

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Điền đầy đủ tất cả các trường NGOẠI TRỪ address (để trống)

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập thông tin vào tất cả các trường trừ address
3. Click nút "Đăng ký"

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Địa chỉ là bắt buộc" hoặc "Thiếu địa chỉ"
- ❌ Form không được submit

---

### TC08 - Thiếu nhập lại mật khẩu ❌

**Mục đích**: Kiểm tra validation khi không nhập xác nhận mật khẩu hoặc nhập không khớp

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Scenario 1: Không nhập confirm_password
- Scenario 2: confirm_password khác password

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập password nhưng không nhập hoặc nhập sai confirm_password
3. Click nút "Đăng ký"

**Test scenarios**:

- Không nhập confirm_password
- Password: "Password123", Confirm: "Password456" (không khớp)

**Kết quả mong đợi**:

- ❌ Scenario 1: "Xác nhận mật khẩu là bắt buộc" hoặc "Thiếu nhập lại mật khẩu"
- ❌ Scenario 2: "Mật khẩu không khớp"
- ❌ Form không được submit

---

### TC09 - Thiếu họ tên ❌

**Mục đích**: Kiểm tra validation khi không nhập họ tên

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ

**Dữ liệu đầu vào**:

- Điền đầy đủ tất cả các trường NGOẠI TRỪ full_name (để trống)

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập thông tin vào tất cả các trường trừ full_name
3. Click nút "Đăng ký"

**Kết quả mong đợi**:

- ❌ Hiển thị thông báo lỗi: "Họ tên là bắt buộc" hoặc "Thiếu họ tên"
- ❌ Form không được submit

---

### TC10 - Dữ liệu nhập quá kích thước cho phép ❌

**Mục đích**: Kiểm tra xử lý khi dữ liệu quá lớn

**Điều kiện tiên quyết**:

- Truy cập trang đăng ký
- Form đã render đầy đủ
- Mock API response 413 Payload Too Large

**Dữ liệu đầu vào**:

- Chuỗi rất dài: 1000 ký tự cho full_name và address

**Các bước thực hiện**:

1. Truy cập `/auth/register`
2. Nhập dữ liệu có kích thước rất lớn
3. Click nút "Đăng ký"
4. API trả về status 413

**Kết quả mong đợi**:

- ❌ Hiển thị toast message: "Dữ liệu nhập quá kích thước cho phép"
- ❌ Form không được submit thành công

---

## Test Cases Bổ Sung

### Additional Test 1 - Form renders correctly

Kiểm tra tất cả các input field được render đúng

### Additional Test 2 - Password field types

Kiểm tra password và confirm_password có type="password"

### Additional Test 3 - Email field type

Kiểm tra email có type="email"

### Additional Test 4 - Phone field type

Kiểm tra phone có type="tel"

### Additional Test 5 - Login link exists

Kiểm tra có link chuyển đến trang đăng nhập

### Additional Test 6 - Submit button loading state

Kiểm tra nút submit hiển thị trạng thái loading khi đang xử lý

### Additional Test 7 - All fields accept input

Kiểm tra tất cả các field chấp nhận input đúng

### Additional Test 8 - All empty fields show errors

Kiểm tra submit form trống hiển thị tất cả thông báo lỗi

### Additional Test 9 - Password mismatch validation

Kiểm tra validation khi password và confirm_password không khớp

---

## Cách chạy tests

### Chạy tất cả tests

```bash
cd D:\used-car-marketplace
npx jest test/frontend/register-complete.ui.test.js --runInBand -c jest.config.js
```

### Chạy test cụ thể

```bash
npx jest test/frontend/register-complete.ui.test.js -t "TC01" --runInBand -c jest.config.js
```

### Chạy với environment variable

```bash
$env:TEST_BASE_URL="http://localhost:3000"; npx jest test/frontend/register-complete.ui.test.js --runInBand -c jest.config.js
```

---

## Yêu cầu môi trường

1. **Web app phải chạy**:

   ```bash
   cd packages/web
   npm run dev
   ```

2. **Port**: Mặc định là `http://localhost:3000` hoặc set `TEST_BASE_URL`

3. **Dependencies**:
   - Jest
   - Puppeteer
   - React Hook Form
   - Yup validation

---

## Kết quả mong đợi

- ✅ Tất cả 10 test cases chính phải PASS
- ✅ Tất cả 9 test cases bổ sung phải PASS
- ✅ Tổng: 19/19 tests PASSED
- ⏱️ Thời gian chạy: ~30-60 giây

---

## Lưu ý quan trọng

1. **Mock API**: Các test sử dụng `page.setRequestInterception(true)` để mock API responses
2. **Timeout**: Mỗi test có timeout 30 giây
3. **Cleanup**: Mỗi test tự động clear localStorage và sessionStorage
4. **Isolation**: Mỗi test chạy độc lập với page mới
5. **Hydration**: Đợi React hydration hoàn tất trước khi test

---

## Troubleshooting

### Test timeout

- Kiểm tra web app có đang chạy không
- Tăng timeout trong jest.config.js
- Kiểm tra network trong Puppeteer

### Element not found

- Đợi waitForHydration()
- Kiểm tra selector có đúng không
- Xem HTML rendered bằng console.log

### Toast not appearing

- Kiểm tra react-hot-toast đã được cài đặt
- Kiểm tra toast container có render không
- Tăng timeout của waitForToast()

---

**Người tạo**: GitHub Copilot  
**Ngày tạo**: November 3, 2025  
**Version**: 1.0
