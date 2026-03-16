const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');
const { AuthError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Sign a JWT access token for a given user ID.
   */
  generateToken(userId, expiresIn = '30d') {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
  }

  /**
   * Sign a JWT refresh token (longer-lived, separate secret).
   */
  generateRefreshToken(userId, expiresIn = '30d') {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn });
  }

  /**
   * Authenticate a regular user. Returns { user, token }.
   */
  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) throw new AuthError('Email hoặc mật khẩu không đúng');
    if (user.is_locked) throw new AuthError('Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new AuthError('Email hoặc mật khẩu không đúng');

    logger.info('User logged in', { userId: user._id });
    return { user, token: this.generateToken(user._id) };
  }

  /**
   * Authenticate an admin user. Returns { user, token, refreshToken }.
   */
  async loginAdmin(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) throw new AuthError('Email hoặc mật khẩu không đúng');
    if (user.role !== 'admin') throw new AuthError('Bạn không có quyền truy cập trang quản trị');
    if (user.is_locked) throw new AuthError('Tài khoản đã bị khóa, vui lòng liên hệ super admin');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new AuthError('Email hoặc mật khẩu không đúng');

    logger.info('Admin logged in', { userId: user._id });
    return {
      user,
      token: this.generateToken(user._id, '8h'),
      refreshToken: this.generateRefreshToken(user._id),
    };
  }

  /**
   * Register a new user account. Returns { user, token }.
   */
  async register(userData) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw new ConflictError('Email đã được đăng ký');

    const user = await userRepository.create({
      ...userData,
      password_hash: userData.password,
      role: 'user', // Always force role to user on public registration
    });

    logger.info('New user registered', { userId: user._id });
    return { user, token: this.generateToken(user._id) };
  }

  /**
   * Verify a refresh token and issue a new access token.
   */
  async refreshAdminToken(refreshToken) {
    if (!refreshToken) throw new AuthError('Refresh token là bắt buộc');

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AuthError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) throw new AuthError('Người dùng không tồn tại');
    if (user.role !== 'admin') throw new AuthError('Không có quyền admin');

    return { token: this.generateToken(user._id, '8h') };
  }
}

module.exports = new AuthService();
