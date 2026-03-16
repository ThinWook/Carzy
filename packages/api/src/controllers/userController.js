const userService = require('../services/userService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userController = {
  // Register new user
  registerUser: async (req, res) => {
    try {
      const {
        full_name,
        email,
        phone_number,
        address,
        password,
        role = "user", // Default to user if not specified
      } = req.body;

      // Basic validation: email and password required
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Always force role to 'user' for registrations
      const userRole = "user";

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "email already registered" });
      }

      // Create new user (model is responsible for hashing in pre-save)
      const user = await User.create({
        full_name,
        email,
        phone_number,
        address,
        password_hash: password,
        role: userRole,
      });

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // Return new user (excluding password/hash)
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
      });
    } catch (error) {
      // Handle duplicate key (race condition) as conflict
      if (error && (error.code === 11000 || error.keyPattern)) {
        return res.status(409).json({ message: "email already registered" });
      }

      // Unknown / DB errors
      res.status(500).json({ message: error.message });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Check if user is locked
      if (user.is_locked) {
        return res.status(401).json({ message: 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên' });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      // Return user (excluding password)
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
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Login admin
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(401).json({ message: 'Bạn không có quyền truy cập trang quản trị' });
      }

      // Check if admin account is locked
      if (user.is_locked) {
        return res.status(401).json({ message: 'Tài khoản đã bị khóa, vui lòng liên hệ super admin' });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Generate JWT token with short expiration for admin (8 hours)
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '8h'
      });

      // Generate refresh token with longer expiration (30 days)
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d'
      });

      // Return user with admin info and tokens
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        token,
        refreshToken
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Refresh admin token
  refreshAdminToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
      }

      // Generate new JWT token
      const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '8h'
      });

      // Return new token
      res.json({
        token: newToken
      });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  },

  // Get user profile (current user)
  getUserProfile: async (req, res) => {
    try {
      // Lấy thông tin user nhưng không bao gồm password_hash
      const user = await User.findById(req.user._id).select('-password_hash');
      
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      // Đếm số lượng xe đã đăng và đã duyệt
      const vehicleCount = await require('../models/Vehicle').countDocuments({ 
        user: user._id,
        status: 'approved'
      });
      
      // Đếm số lượng xe yêu thích
      const favoriteCount = await require('../models/Favorite').countDocuments({
        user: user._id
      });
      
      // Tạo đối tượng phản hồi từ thông tin người dùng
      const userResponse = {
        ...user.toObject(),
        vehicle_count: vehicleCount,
        favorite_count: favoriteCount
      };
      
      res.json(userResponse);
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields if provided
      user.full_name = req.body.full_name || user.full_name;
      user.email = req.body.email || user.email;
      user.phone_number = req.body.phone_number || user.phone_number;
      user.address = req.body.address || user.address;
      
      // Update password if provided
      if (req.body.password) {
        user.password_hash = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
        cover_image_url: updatedUser.cover_image_url,
        rating: updatedUser.rating,
        kyc_status: updatedUser.kyc_status,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update user avatar
  updateUserAvatar: async (req, res) => {
    try {
      console.log('Upload avatar request received');
      console.log('User:', req.user);
      console.log('Files:', req.file);

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update avatar field
      user.avatar_url = req.file.path;
      await user.save();

      console.log('Upload successful. New avatar:', user.avatar_url);
      res.json({ 
        avatar_url: user.avatar_url,
        message: 'Avatar updated successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update user cover image
  updateUserCoverImage: async (req, res) => {
    try {
      console.log('Upload cover image request received');
      console.log('User:', req.user);
      console.log('Files:', req.file);

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update cover image field
      user.cover_image_url = req.file.path;
      await user.save();

      console.log('Upload successful. New cover image:', user.cover_image_url);
      res.json({ 
        cover_image_url: user.cover_image_url,
        message: 'Cover image updated successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      await userService.deleteUser(req.user._id);
      res.json({ message: 'User removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Upload KYC documents
  uploadKycDocuments: async (req, res) => {
    try {
      console.log('Upload KYC documents request received');
      console.log('User:', req.user);
      console.log('Files:', req.files);

      if (!req.files || (!req.files.front && !req.files.back)) {
        console.log('No files uploaded');
        return res.status(400).json({ message: 'Please upload document images' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize identity_document_images if it doesn't exist
      if (!user.identity_document_images) {
        user.identity_document_images = {};
      }

      // Update document image fields
      if (req.files.front) {
        user.identity_document_images.front = req.files.front[0].path;
      }
      
      if (req.files.back) {
        user.identity_document_images.back = req.files.back[0].path;
      }
      
      await user.save();

      console.log('Upload successful. New documents:', user.identity_document_images);
      res.json({ 
        urls: {
          front: user.identity_document_images.front,
          back: user.identity_document_images.back
        },
        message: 'KYC documents uploaded successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update KYC information
  updateKyc: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update KYC fields if provided
      if (req.body.identity_document_type) {
        user.identity_document_type = req.body.identity_document_type;
      }
      
      if (req.body.identity_document_number) {
        user.identity_document_number = req.body.identity_document_number;
      }
      
      if (req.body.identity_document_images) {
        // Initialize if it doesn't exist
        if (!user.identity_document_images) {
          user.identity_document_images = {};
        }
        
        // Update only the provided fields
        if (req.body.identity_document_images.front) {
          user.identity_document_images.front = req.body.identity_document_images.front;
        }
        
        if (req.body.identity_document_images.back) {
          user.identity_document_images.back = req.body.identity_document_images.back;
        }
      }
      
      // Update bank account information
      if (req.body.bank_account_name) {
        user.bank_account_name = req.body.bank_account_name;
      }
      
      if (req.body.bank_account_number) {
        user.bank_account_number = req.body.bank_account_number;
      }
      
      if (req.body.bank_name) {
        user.bank_name = req.body.bank_name;
      }
      
      // Update KYC status
      if (req.body.kyc_status) {
        user.kyc_status = req.body.kyc_status;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        identity_document_type: updatedUser.identity_document_type,
        identity_document_number: updatedUser.identity_document_number,
        identity_document_images: updatedUser.identity_document_images,
        bank_account_name: updatedUser.bank_account_name,
        bank_account_number: updatedUser.bank_account_number,
        bank_name: updatedUser.bank_name,
        kyc_status: updatedUser.kyc_status,
        message: 'KYC information updated successfully'
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all users (admin only) with filtering and pagination
  getUsers: async (req, res) => {
    try {
      // Lấy các tham số từ query string
      const { 
        search = '', 
        role = '', 
        is_locked, 
        kyc_status = '',
        page = 1, 
        limit = 10,
        exclude_admin = 'true'
      } = req.query;

      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Xây dựng query filter
      const filter = {};
      
      // Lọc theo vai trò nếu được chỉ định
      if (role && role !== 'all') {
        filter.role = role;
      } else if (exclude_admin === 'true') {
        // Nếu không chọn role cụ thể và exclude_admin là true, loại trừ vai trò admin
        filter.role = { $ne: 'admin' };
      }

      // Lọc theo trạng thái KYC nếu được chỉ định
      if (kyc_status && kyc_status !== 'all') {
        filter.kyc_status = kyc_status;
      }

      // Lọc theo trạng thái khóa tài khoản
      if (is_locked !== undefined) {
        // Chuyển đổi từ string sang boolean
        filter.is_locked = is_locked === 'true';
      }

      // Tìm kiếm theo tên, email hoặc số điện thoại
      if (search) {
        filter.$or = [
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone_number: { $regex: search, $options: 'i' } }
        ];
      }

      // Chuyển đổi page và limit thành số
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      // Tính toán số bản ghi bỏ qua
      const skip = (pageNum - 1) * limitNum;

      // Đếm tổng số người dùng phù hợp với filter
      const total = await User.countDocuments(filter);

      // Lấy danh sách người dùng
      const users = await User.find(filter)
        .sort({ created_at: -1 }) // Sắp xếp mới nhất trước
        .skip(skip)
        .limit(limitNum)
        .select('-password_hash'); // Loại bỏ trường password_hash

      // Tính toán thông tin phân trang
      const totalPages = Math.ceil(total / limitNum);
      const hasMore = pageNum < totalPages;

      res.json({
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasMore
        }
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lock/unlock user (admin only)
  toggleUserLock: async (req, res) => {
    try {
      const { userId, isLocked } = req.body;

      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Tìm và cập nhật người dùng
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Ngăn chặn admin khóa tài khoản admin khác
      if (user.role === 'admin' && req.user._id.toString() !== userId) {
        return res.status(403).json({ message: 'Không thể khóa tài khoản admin khác' });
      }

      // Cập nhật trạng thái khóa
      user.is_locked = isLocked;
      await user.save();

      res.json({ 
        message: isLocked ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở khóa',
        user: {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_locked: user.is_locked,
          kyc_status: user.kyc_status
        }
      });
    } catch (error) {
      console.error('Error in toggleUserLock:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Update KYC status (admin only)
  updateKycStatus: async (req, res) => {
    try {
      const { userId, kycStatus } = req.body;

      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Kiểm tra trạng thái KYC hợp lệ
      if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
        return res.status(400).json({ message: 'Trạng thái KYC không hợp lệ' });
      }

      // Tìm và cập nhật người dùng
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Cập nhật trạng thái KYC
      user.kyc_status = kycStatus;
      await user.save();

      res.json({ 
        message: `Trạng thái KYC đã được cập nhật thành ${kycStatus}`,
        user: {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          kyc_status: user.kyc_status
        }
      });
    } catch (error) {
      console.error('Error in updateKycStatus:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy chi tiết người dùng theo ID (admin only)
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;

      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      // Tìm người dùng
      const user = await User.findById(userId).select('-password_hash');
      
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Định dạng lại URL cho avatar và cover image nếu cần
      // Đảm bảo đường dẫn đầy đủ cho các hình ảnh
      if (user.avatar_url && !user.avatar_url.startsWith('http')) {
        const apiBaseUrl = process.env.API_URL || 'http://localhost:5000';
        user.avatar_url = `${apiBaseUrl}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`;
      }
      
      if (user.cover_image_url && !user.cover_image_url.startsWith('http')) {
        const apiBaseUrl = process.env.API_URL || 'http://localhost:5000';
        user.cover_image_url = `${apiBaseUrl}${user.cover_image_url.startsWith('/') ? '' : '/'}${user.cover_image_url}`;
      }

      res.json({ 
        user
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = userController; 