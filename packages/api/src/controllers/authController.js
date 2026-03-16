const authService = require('../services/authService');

/**
 * AuthController — handles HTTP for authentication endpoints only.
 * All business logic is delegated to authService.
 */
const authController = {
  register: async (req, res, next) => {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        created_at: user.created_at,
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { user, token } = await authService.login(req.body.email, req.body.password);
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        created_at: user.created_at,
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  loginAdmin: async (req, res, next) => {
    try {
      const { user, token, refreshToken } = await authService.loginAdmin(req.body.email, req.body.password);
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshAdminToken: async (req, res, next) => {
    try {
      const result = await authService.refreshAdminToken(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const userService = require('../services/userService');
      const userProfile = await userService.getProfile(req.user._id);
      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
