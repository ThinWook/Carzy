const { validationResult } = require('express-validator');

/**
 * Middleware helper — đọc kết quả validate từ express-validator.
 * Đặt sau các validator rules, trước controller.
 * Trả về 422 nếu có lỗi, tiếp tục nếu hợp lệ.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'validation_error',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
