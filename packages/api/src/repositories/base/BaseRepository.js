/**
 * BaseRepository — abstract base for all repositories.
 * Wraps Mongoose model operations and exposes a clean, testable interface.
 * Concrete repositories extend this class and add domain-specific queries.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, projection = '') {
    return this.model.findById(id).select(projection);
  }

  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    const { sort = { created_at: -1 }, populate = '' } = options;
    let query = this.model.find(filter).sort(sort);
    if (populate) query = query.populate(populate);
    return query;
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  /**
   * Paginated query. Returns { data, total, page, limit, pages }.
   */
  async paginate(filter = {}, { page = 1, limit = 10, sort = { created_at: -1 }, populate = '' } = {}) {
    const skip = (page - 1) * limit;
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([
      query,
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = BaseRepository;
