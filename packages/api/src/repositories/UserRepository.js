const BaseRepository = require('./base/BaseRepository');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Favorite = require('../models/Favorite');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  /**
   * User profile without password, with vehicle and favorite counts.
   */
  async findWithStats(userId) {
    const [user, vehicleCount, favoriteCount] = await Promise.all([
      this.model.findById(userId).select('-password_hash'),
      Vehicle.countDocuments({ user: userId, status: 'approved' }),
      Favorite.countDocuments({ user: userId }),
    ]);
    return { user, vehicleCount, favoriteCount };
  }

  /**
   * Paginated user list for admin, with optional search filter.
   */
  async findAllWithPagination(filters = {}, { page = 1, limit = 10 } = {}) {
    return this.paginate(filters, {
      page,
      limit,
      sort: { created_at: -1 },
    });
  }
}

module.exports = new UserRepository();
