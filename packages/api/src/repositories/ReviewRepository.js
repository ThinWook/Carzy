const BaseRepository = require('./base/BaseRepository');
const Review = require('../models/Review');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  /**
   * Lấy danh sách đánh giá của một người dùng
   */
  async getReviewsByUser(userId) {
    return this.find({ user: userId }, {
      sort: { createdAt: -1 },
      populate: { path: 'reviewer', select: 'full_name avatar_url' }
    });
  }

  /**
   * Tính trung bình sao (rating) của 1 người dùng từ các đánh giá
   */
  async getUserAverageRating(userId) {
    const reviews = await this.model.find({ user: userId });
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
}

module.exports = new ReviewRepository();
