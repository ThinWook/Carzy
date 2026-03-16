const { body } = require('express-validator');
const validate = require('./validate');

/**
 * Validators cho vehicle endpoints.
 */

const VALID_TYPES = ['car', 'motorcycle', 'bicycle', 'truck', 'other'];
const CURRENT_YEAR = new Date().getFullYear();

const createVehicleValidators = [
  body('title')
    .notEmpty().withMessage('Tiêu đề tin đăng là bắt buộc')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Tiêu đề cần từ 5 đến 200 ký tự'),

  body('type')
    .notEmpty().withMessage('Loại xe là bắt buộc')
    .isIn(VALID_TYPES).withMessage(`Loại xe không hợp lệ (${VALID_TYPES.join(', ')})`),

  body('make')
    .notEmpty().withMessage('Hãng xe là bắt buộc')
    .trim(),

  body('model')
    .notEmpty().withMessage('Model xe là bắt buộc')
    .trim(),

  body('year')
    .notEmpty().withMessage('Năm sản xuất là bắt buộc')
    .isInt({ min: 1900, max: CURRENT_YEAR + 1 })
    .withMessage(`Năm sản xuất phải từ 1900 đến ${CURRENT_YEAR + 1}`),

  body('price')
    .notEmpty().withMessage('Giá xe là bắt buộc')
    .isFloat({ min: 0 }).withMessage('Giá xe phải là số không âm'),

  body('location')
    .notEmpty().withMessage('Địa điểm là bắt buộc')
    .trim(),

  body('description')
    .notEmpty().withMessage('Mô tả xe là bắt buộc')
    .trim()
    .isLength({ min: 10 }).withMessage('Mô tả cần ít nhất 10 ký tự'),

  validate,
];

const updateVehicleStatusValidators = [
  body('status')
    .notEmpty().withMessage('Trạng thái là bắt buộc')
    .isIn(['pending', 'approved', 'rejected', 'sold', 'removed'])
    .withMessage('Trạng thái không hợp lệ'),

  validate,
];

module.exports = { createVehicleValidators, updateVehicleStatusValidators };
