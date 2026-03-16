const BaseRepository = require('./base/BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    return this.paginate(
      { user_id: userId },
      { page, limit, sort: { created_at: -1 } }
    );
  }

  async markAllAsRead(userId) {
    return this.model.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }

  async getUnreadCount(userId) {
    return this.model.countDocuments({ user_id: userId, is_read: false });
  }
}

module.exports = new NotificationRepository();
