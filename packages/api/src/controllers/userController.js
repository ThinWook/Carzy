const userService = require('../services/userService');

/**
 * UserController — thin HTTP interface for user-related endpoints.
 * All business logic lives in userService.
 */
const userController = {
  // Keep for backward compat — auth/register and auth/login now go through authController
  registerUser: async (req, res, next) => {
    try {
      const authService = require('../services/authService');
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        _id: user._id, full_name: user.full_name, email: user.email,
        phone_number: user.phone_number, address: user.address, role: user.role,
        avatar_url: user.avatar_url, cover_image_url: user.cover_image_url,
        rating: user.rating, created_at: user.created_at, token,
      });
    } catch (error) { next(error); }
  },

  loginUser: async (req, res, next) => {
    try {
      const authService = require('../services/authService');
      const { user, token } = await authService.login(req.body.email, req.body.password);
      res.json({
        _id: user._id, full_name: user.full_name, email: user.email,
        phone_number: user.phone_number, address: user.address, role: user.role,
        avatar_url: user.avatar_url, cover_image_url: user.cover_image_url,
        rating: user.rating, created_at: user.created_at, token,
      });
    } catch (error) { next(error); }
  },

  loginAdmin: async (req, res, next) => {
    try {
      const authService = require('../services/authService');
      const { user, token, refreshToken } = await authService.loginAdmin(req.body.email, req.body.password);
      res.json({
        _id: user._id, full_name: user.full_name, email: user.email,
        phone_number: user.phone_number, address: user.address, role: user.role,
        avatar_url: user.avatar_url, token, refreshToken,
      });
    } catch (error) { next(error); }
  },

  refreshAdminToken: async (req, res, next) => {
    try {
      const authService = require('../services/authService');
      const result = await authService.refreshAdminToken(req.body.refreshToken);
      res.json(result);
    } catch (error) { next(error); }
  },

  getUserProfile: async (req, res, next) => {
    try {
      const profile = await userService.getProfile(req.user._id);
      res.json(profile);
    } catch (error) { next(error); }
  },

  updateUserProfile: async (req, res, next) => {
    try {
      const updated = await userService.updateProfile(req.user._id, req.body);
      res.json({
        _id: updated._id, full_name: updated.full_name, email: updated.email,
        phone_number: updated.phone_number, address: updated.address, role: updated.role,
        avatar_url: updated.avatar_url, cover_image_url: updated.cover_image_url,
        rating: updated.rating, kyc_status: updated.kyc_status,
        created_at: updated.created_at, updated_at: updated.updated_at,
      });
    } catch (error) { next(error); }
  },

  deleteUser: async (req, res, next) => {
    try {
      await userService.deleteAccount(req.user._id);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) { next(error); }
  },

  updateUserAvatar: async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
      const avatar_url = await userService.updateAvatar(req.user._id, req.file.path);
      res.json({ avatar_url, message: 'Avatar updated successfully' });
    } catch (error) { next(error); }
  },

  updateUserCoverImage: async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
      const cover_image_url = await userService.updateCoverImage(req.user._id, req.file.path);
      res.json({ cover_image_url, message: 'Cover image updated successfully' });
    } catch (error) { next(error); }
  },

  uploadKycDocuments: async (req, res, next) => {
    try {
      if (!req.files || (!req.files.front && !req.files.back)) {
        return res.status(400).json({ message: 'Please upload document images' });
      }
      const urls = await userService.uploadKycDocuments(req.user._id, req.files);
      res.json({ urls, message: 'KYC documents uploaded successfully' });
    } catch (error) { next(error); }
  },

  updateKyc: async (req, res, next) => {
    try {
      const updated = await userService.updateKyc(req.user._id, req.body);
      res.json({
        _id: updated._id,
        identity_document_type: updated.identity_document_type,
        identity_document_number: updated.identity_document_number,
        identity_document_images: updated.identity_document_images,
        bank_account_name: updated.bank_account_name,
        bank_account_number: updated.bank_account_number,
        bank_name: updated.bank_name,
        kyc_status: updated.kyc_status,
        message: 'KYC information updated successfully',
      });
    } catch (error) { next(error); }
  },

  getUsers: async (req, res, next) => {
    try {
      const result = await userService.getUsers(req.query, req.user);
      res.json(result);
    } catch (error) { next(error); }
  },

  toggleUserLock: async (req, res, next) => {
    try {
      const user = await userService.toggleUserLock(req.body.userId, req.body.isLocked, req.user);
      res.json({
        message: req.body.isLocked ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở khóa',
        user: { _id: user._id, full_name: user.full_name, email: user.email, role: user.role, is_locked: user.is_locked, kyc_status: user.kyc_status },
      });
    } catch (error) { next(error); }
  },

  updateKycStatus: async (req, res, next) => {
    try {
      const user = await userService.updateKycStatus(req.body.userId, req.body.kycStatus, req.user);
      res.json({
        message: `Trạng thái KYC đã được cập nhật thành ${req.body.kycStatus}`,
        user: { _id: user._id, full_name: user.full_name, email: user.email, role: user.role, kyc_status: user.kyc_status },
      });
    } catch (error) { next(error); }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.params.id, req.user);
      res.json({ user });
    } catch (error) { next(error); }
  },
};

module.exports = userController;