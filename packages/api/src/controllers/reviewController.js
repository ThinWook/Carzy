const reviewService = require('../services/reviewService');

const reviewController = {
  // Create a new review
  createReview: async (req, res, next) => {
    try {
      const reviewData = {
        ...req.body,
        reviewer: req.user._id
      };
      const review = await reviewService.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  // Get reviews by user
  getReviewsByUser: async (req, res, next) => {
    try {
      const reviews = await reviewService.getReviewsByUser(req.params.userId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  },

  // Get user rating
  getUserRating: async (req, res, next) => {
    try {
      const rating = await reviewService.getUserRating(req.params.userId);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  },

  // Update review
  updateReview: async (req, res, next) => {
    try {
      const review = await reviewService.updateReview(req.params.id, req.body);
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  // Delete review
  deleteReview: async (req, res, next) => {
    try {
      await reviewService.deleteReview(req.params.id);
      res.json({ message: 'Đánh giá đã được xóa thành công' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reviewController;