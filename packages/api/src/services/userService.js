const userRepository = require('../repositories/UserRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

class UserService {
  async getProfile(userId) {
    const { user, vehicleCount, favoriteCount } = await userRepository.findWithStats(userId);
    if (!user) throw new NotFoundError('Người dùng');
    return { ...user.toObject(), vehicle_count: vehicleCount, favorite_count: favoriteCount };
  }

  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');

    user.full_name = data.full_name || user.full_name;
    user.email = data.email || user.email;
    user.phone_number = data.phone_number || user.phone_number;
    user.address = data.address || user.address;
    if (data.password) user.password_hash = data.password;

    return user.save();
  }

  async updateAvatar(userId, fileUrl) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');
    user.avatar_url = fileUrl;
    await user.save();
    logger.info('Avatar updated', { userId });
    return user.avatar_url;
  }

  async updateCoverImage(userId, fileUrl) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');
    user.cover_image_url = fileUrl;
    await user.save();
    logger.info('Cover image updated', { userId });
    return user.cover_image_url;
  }

  async uploadKycDocuments(userId, files) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');

    if (!user.identity_document_images) user.identity_document_images = {};
    if (files.front?.[0]) user.identity_document_images.front = files.front[0].path;
    if (files.back?.[0]) user.identity_document_images.back = files.back[0].path;

    await user.save();
    logger.info('KYC documents uploaded', { userId });
    return user.identity_document_images;
  }

  async updateKyc(userId, kycData) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');

    if (kycData.identity_document_type) user.identity_document_type = kycData.identity_document_type;
    if (kycData.identity_document_number) user.identity_document_number = kycData.identity_document_number;
    if (kycData.identity_document_images) {
      if (!user.identity_document_images) user.identity_document_images = {};
      if (kycData.identity_document_images.front) user.identity_document_images.front = kycData.identity_document_images.front;
      if (kycData.identity_document_images.back) user.identity_document_images.back = kycData.identity_document_images.back;
    }
    if (kycData.bank_account_name) user.bank_account_name = kycData.bank_account_name;
    if (kycData.bank_account_number) user.bank_account_number = kycData.bank_account_number;
    if (kycData.bank_name) user.bank_name = kycData.bank_name;
    if (kycData.kyc_status) user.kyc_status = kycData.kyc_status;

    return user.save();
  }

  async deleteAccount(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');
    await userRepository.deleteById(userId);
    logger.info('User deleted', { userId });
  }

  // --- Admin operations ---

  async getUsers(query = {}, requestUser) {
    if (requestUser.role !== 'admin') throw new ForbiddenError('Không có quyền truy cập');

    const { search = '', role = '', is_locked, kyc_status = '', page = 1, limit = 10, exclude_admin = 'true' } = query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    } else if (exclude_admin === 'true') {
      filter.role = { $ne: 'admin' };
    }

    if (kyc_status && kyc_status !== 'all') filter.kyc_status = kyc_status;
    if (is_locked !== undefined) filter.is_locked = is_locked === 'true';
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone_number: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await userRepository.findAllWithPagination(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalPages = Math.ceil(result.total / result.limit);
    return {
      users: result.data.map(u => { const o = u.toObject(); delete o.password_hash; return o; }),
      pagination: { total: result.total, page: result.page, limit: result.limit, totalPages, hasMore: result.page < totalPages },
    };
  }

  async toggleUserLock(userId, isLocked, requestUser) {
    if (requestUser.role !== 'admin') throw new ForbiddenError('Không có quyền truy cập');

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');
    if (user.role === 'admin' && requestUser._id.toString() !== userId) {
      throw new ForbiddenError('Không thể khóa tài khoản admin khác');
    }

    user.is_locked = isLocked;
    await user.save();
    logger.info('User lock toggled', { userId, isLocked });
    return user;
  }

  async updateKycStatus(userId, kycStatus, requestUser) {
    if (requestUser.role !== 'admin') throw new ForbiddenError('Không có quyền truy cập');
    if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
      throw new Error('Trạng thái KYC không hợp lệ');
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('Người dùng');

    user.kyc_status = kycStatus;
    await user.save();
    logger.info('KYC status updated', { userId, kycStatus });
    return user;
  }

  async getUserById(userId, requestUser) {
    if (requestUser.role !== 'admin') throw new ForbiddenError('Không có quyền truy cập');
    const user = await userRepository.findById(userId, '-password_hash');
    if (!user) throw new NotFoundError('Người dùng');
    return user;
  }
}

module.exports = new UserService();