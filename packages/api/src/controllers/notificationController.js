const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/responseUtil');
const { NotFoundError } = require('../utils/errors');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await notificationService.getUserNotifications(userId, page, limit);
    return successResponse(res, 'Lấy danh sách thông báo thành công', result);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const notification = await notificationService.markAsRead(notificationId);
    
    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }
    
    return successResponse(res, 'Đánh dấu thông báo đã đọc thành công', notification);
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    
    return successResponse(res, 'Đánh dấu tất cả thông báo đã đọc thành công', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    
    return successResponse(res, 'Lấy số lượng thông báo chưa đọc thành công', { count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};