# Unit Test Summary

## 📊 Tổng quan

- **Tổng số test suites**: 3
- **Tổng số test cases**: 30 (10 tests/file)
- **Trạng thái**: ✅ TẤT CẢ PASS
- **Thời gian chạy**: ~2.3 giây

---

## 📝 Chi tiết Test Cases

### 1. FavoriteController - addToFavorites (10 tests) ✅

#### Test Cases:

1. ✅ **should return 400 if vehicleId is not valid ObjectId**

   - Kiểm tra validation cho vehicleId không hợp lệ

2. ✅ **should return 404 if vehicle does not exist**

   - Kiểm tra trường hợp xe không tồn tại trong database

3. ✅ **should return 400 if vehicle is already in favorites**

   - Kiểm tra không cho phép thêm xe đã có trong danh sách yêu thích

4. ✅ **should create favorite and return 201 if successful**

   - Kiểm tra thêm xe vào yêu thích thành công

5. ✅ **should handle duplicate key error**

   - Kiểm tra xử lý lỗi duplicate key (code 11000)

6. ✅ **should return 400 if an error occurs**

   - Kiểm tra xử lý lỗi chung từ database

7. ✅ **should return correct favoriteCount when user has multiple favorites**

   - Kiểm tra đếm đúng số lượng xe yêu thích khi có nhiều xe

8. ✅ **should return favoriteCount as 1 when adding first favorite**

   - Kiểm tra favoriteCount = 1 khi thêm xe yêu thích đầu tiên

9. ✅ **should return 400 if vehicleId is empty**

   - Kiểm tra validation khi vehicleId rỗng

10. ✅ **should return 400 if save fails with custom error**
    - Kiểm tra xử lý lỗi custom khi save thất bại

---

### 2. UserController - loginUser (10 tests) ✅

#### Test Cases:

1. ✅ **should return 401 if user does not exist**

   - Kiểm tra login với email không tồn tại

2. ✅ **should return 401 if user is locked**

   - Kiểm tra không cho phép login tài khoản bị khóa

3. ✅ **should return 401 if password does not match**

   - Kiểm tra login với mật khẩu sai

4. ✅ **should return user data and token if login is successful**

   - Kiểm tra login thành công và trả về JWT token

5. ✅ **should return 400 if an error occurs**

   - Kiểm tra xử lý exception chung

6. ✅ **should return 401 if email is empty**

   - Kiểm tra validation khi email rỗng

7. ✅ **should return 401 if password is empty**

   - Kiểm tra validation khi password rỗng

8. ✅ **should login successfully with admin role**

   - Kiểm tra login thành công với role admin

9. ✅ **should return 400 if matchPassword throws error**

   - Kiểm tra xử lý lỗi khi matchPassword fail

10. ✅ **should generate token with correct user id**
    - Kiểm tra token được tạo với đúng user id

---

### 3. VehicleController - createVehicle (10 tests) ✅

#### Test Cases:

1. ✅ **should return 400 if request body is missing**

   - Kiểm tra validation khi thiếu request body

2. ✅ **should return 401 if user is not authenticated**

   - Kiểm tra authentication của user

3. ✅ **should create vehicle and return 201 if successful**

   - Kiểm tra tạo xe thành công với dữ liệu cơ bản

4. ✅ **should return 400 if validation fails**

   - Kiểm tra xử lý ValidationError từ mongoose

5. ✅ **should return 400 if duplicate key error occurs**

   - Kiểm tra xử lý lỗi duplicate key (code 11000)

6. ✅ **should return 500 if a generic error occurs**

   - Kiểm tra xử lý lỗi chung (500)

7. ✅ **should create vehicle with complete data**

   - Kiểm tra tạo xe với đầy đủ thông tin (mileage, body_type, fuel_type, transmission)

8. ✅ **should return 400 if required field title is missing**

   - Kiểm tra validation khi thiếu trường title bắt buộc

9. ✅ **should return 400 if price is negative**

   - Kiểm tra validation khi price âm

10. ✅ **should return 400 if year is invalid**
    - Kiểm tra validation khi year không hợp lệ

---

## 🎯 Coverage

Tất cả test cases đều sử dụng mocking để:

- Mock mongoose models và methods
- Mock console để tránh log noise
- Mock request/response objects
- Mock external dependencies (jwt, bcrypt)

## 🚀 Chạy Tests

```bash
# Chạy tất cả unit tests
npx jest "test/Unit test"

# Chạy với verbose mode
npx jest "test/Unit test" --verbose

# Chạy với coverage
npx jest "test/Unit test" --coverage
```

## 📌 Lưu ý

- Tất cả tests đều độc lập và không phụ thuộc vào database thật
- Sử dụng mocking để kiểm soát behavior của dependencies
- Mỗi test case được reset mocks trước khi chạy (beforeEach)
- Tests cover cả happy path và error cases
