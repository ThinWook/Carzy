const notificationRepository = require('../repositories/NotificationRepository');

const createNotification = async (userId, title, message, type, options = {}) => {
  const { reference_id, reference_model, link } = options;
  return await notificationRepository.create({
    user_id: userId,
    title,
    message,
    type,
    reference_id,
    reference_model,
    link
  });
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const result = await notificationRepository.getUserNotifications(userId, page, limit);
  return {
    notifications: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages
    }
  };
};

const markAsRead = async (notificationId) => {
  return await notificationRepository.updateById(
    notificationId,
    { is_read: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

const getUnreadCount = async (userId) => {
  return await notificationRepository.getUnreadCount(userId);
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};