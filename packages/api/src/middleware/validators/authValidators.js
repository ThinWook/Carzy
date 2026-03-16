const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Validators cho auth endpoints (register & login).
 * Mỗi export là một mảng middleware — dùng trực tiếp trong router.
 */

const registerValidators = [
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 8 }).withMessage('Mật khẩu cần ít nhất 8 ký tự'),

  body('full_name')
    .notEmpty().withMessage('Họ và tên là bắt buộc')
    .trim()
    .isLength({ min: 2 }).withMessage('Họ và tên cần ít nhất 2 ký tự'),

  body('phone_number')
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại phải có 10-11 chữ số'),

  body('address')
    .notEmpty().withMessage('Địa chỉ là bắt buộc')
    .trim(),

  validate,
];

const loginValidators = [
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không đúng định dạng'),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),

  validate,
];

module.exports = { registerValidators, loginValidators };
