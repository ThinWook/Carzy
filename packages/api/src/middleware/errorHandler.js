const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Đăng ký CUỐI CÙNG trong index.js sau tất cả routes.
 * Bắt mọi lỗi được next(err) từ bất kỳ middleware/controller nào.
 */
const errorHandler = (err, req, res, next) => {
  // Lỗi có thể dự đoán (operational) — trả về message rõ ràng
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Lỗi Mongoose: CastError (sai ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: `Định dạng ID không hợp lệ: ${err.value}`,
    });
  }

  // Lỗi Mongoose: Duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      status: 'error',
      message: `Giá trị '${field}' đã tồn tại, vui lòng dùng giá trị khác`,
    });
  }

  // Lỗi Mongoose: ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      status: 'validation_error',
      message: messages.join(', '),
    });
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token đã hết hạn, vui lòng đăng nhập lại',
    });
  }

  // Lỗi không mong đợi — log chi tiết nhưng KHÔNG lộ stack ra client
  logger.error('Unexpected server error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Đã xảy ra lỗi, vui lòng thử lại sau.'
        : err.message,
  });
};

module.exports = errorHandler;
