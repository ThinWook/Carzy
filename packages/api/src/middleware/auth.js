const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthError } = require('../utils/errors');

/**
 * Protect route middleware — reads token from HttpOnly cookie first,
 * falls back to Bearer header for API/mobile clients.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) return next(new AuthError('Chưa đăng nhập'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password_hash');

    if (!req.user) return next(new AuthError('Token hợp lệ nhưng người dùng không tồn tại'));

    next();
  } catch {
    next(new AuthError('Token không hợp lệ hoặc đã hết hạn'));
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Không có quyền admin' });
};

/**
 * KYC guard — requires user to have verified identity documents.
 */
const verifiedKyc = (req, res, next) => {
  if (req.user?.kyc_status === 'verified') return next();
  res.status(403).json({ message: 'Tài khoản chưa được xác thực KYC' });
};

module.exports = { protect, admin, verifiedKyc };