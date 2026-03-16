const reviewRepository = require('../repositories/ReviewRepository');
const vehicleRepository = require('../repositories/VehicleRepository');
const userRepository = require('../repositories/UserRepository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class ReviewService {
  async createReview(reviewData) {
    // Validate existence
    const vehicle = await vehicleRepository.findById(reviewData.vehicle);
    if (!vehicle) throw new NotFoundError('Không tìm thấy phương tiện');

    const user = await userRepository.findById(reviewData.user);
    if (!user) throw new NotFoundError('Không tìm thấy người bán');

    // Prevent self-review
    if (reviewData.user.toString() === reviewData.reviewer.toString()) {
      throw new BadRequestError('Bạn không thể tự đánh giá chính mình');
    }

    try {
      return await reviewRepository.create(reviewData);
    } catch (error) {
      // Bắt lỗi unique index: 1 reviewer chỉ đánh giá 1 user trên 1 vehicle 1 lần
      if (error.code === 11000) {
        throw new BadRequestError('Bạn đã đánh giá giao dịch này rồi');
      }
      throw error;
    }
  }

  async getReviewsByUser(userId) {
    return await reviewRepository.getReviewsByUser(userId);
  }

  async getUserRating(userId) {
    return await reviewRepository.getUserAverageRating(userId);
  }

  async updateReview(reviewId, updateData) {
    const review = await reviewRepository.updateById(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá');
    return review;
  }

  async deleteReview(reviewId) {
    const review = await reviewRepository.deleteById(reviewId);
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá');
    return review;
  }
}

module.exports = new ReviewService();