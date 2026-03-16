const BaseRepository = require('./base/BaseRepository');
const Vehicle = require('../models/Vehicle');

const USER_POPULATE = 'full_name email phone_number avatar_url rating';

class VehicleRepository extends BaseRepository {
  constructor() {
    super(Vehicle);
  }

  /**
   * Paginated list with optional filters. Used by getAllVehicles.
   */
  async findAllWithPagination(filters = {}, { page = 1, limit = 10 } = {}) {
    return this.paginate(filters, {
      page,
      limit,
      sort: { created_at: -1 },
      populate: { path: 'user', select: USER_POPULATE },
    });
  }

  /**
   * Single vehicle with owner info populated.
   */
  async findByIdWithUser(id) {
    return this.model
      .findById(id)
      .populate('user', USER_POPULATE);
  }

  /**
   * All vehicles belonging to a specific user.
   */
  async findByUser(userId) {
    return this.model
      .find({ user: userId })
      .populate('user', USER_POPULATE)
      .sort({ created_at: -1 });
  }

  /**
   * Paginated list for admin dashboard with full filter support.
   */
  async findForAdmin(filters = {}, { page = 1, limit = 10 } = {}) {
    return this.paginate(filters, {
      page,
      limit,
      sort: { created_at: -1 },
      populate: { path: 'user', select: 'full_name email phone_number avatar_url' },
    });
  }

  /**
   * Full-text quick search across title, make, model.
   */
  async quickSearch(query, limit = 5) {
    return this.model
      .find({
        status: 'approved',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { make: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } },
        ],
      })
      .select('title make model price type images year')
      .limit(limit);
  }
}

module.exports = new VehicleRepository();
