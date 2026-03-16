const vehicleRepository = require('../repositories/VehicleRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');
const eventBus = require('../events/eventBus');

class VehicleService {
  async getAll(query = {}) {
    const { type, brand, minPrice, maxPrice, condition, location, page = 1, limit = 10 } = query;

    const filters = { status: 'approved' };
    if (type) filters.type = type;
    if (brand) filters.make = brand;
    if (condition) filters.condition = condition;
    if (location) filters.location = location;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const result = await vehicleRepository.findAllWithPagination(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return {
      vehicles: result.data,
      pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    };
  }

  async getById(id) {
    const vehicle = await vehicleRepository.findByIdWithUser(id);
    if (!vehicle) throw new NotFoundError('Xe');
    return vehicle;
  }

  async create(vehicleData, userId) {
    const data = {
      title: vehicleData.title,
      description: vehicleData.description,
      type: vehicleData.type,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      price: vehicleData.price,
      location: vehicleData.location,
      mileage: vehicleData.mileage || 0,
      body_type: vehicleData.body_type || 'Other',
      fuel_type: vehicleData.fuel_type || 'Other',
      transmission: vehicleData.transmission || 'Other',
      images: [],
      user: userId,
      status: 'pending',
    };

    const vehicle = await vehicleRepository.create(data);
    logger.info('Vehicle created', { vehicleId: vehicle._id, userId });
    return vehicle;
  }

  async update(id, updateData, requestUser) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundError('Xe');

    const isAdmin = ['admin', 'moderator'].includes(requestUser.role);
    const isOwner = vehicle.user.toString() === requestUser._id.toString();
    if (!isAdmin && !isOwner) throw new ForbiddenError('Bạn không có quyền chỉnh sửa xe này');

    const oldStatus = vehicle.status;
    const updated = await vehicleRepository.updateById(id, updateData);

    // Emit event for status change — notification handled by vehicleEventHandler
    if (isAdmin && updateData.status && oldStatus !== updateData.status && updated.user) {
      if (updateData.status === 'approved') {
        eventBus.emit('vehicle:approved', { vehicle: updated, userId: updated.user });
      } else if (updateData.status === 'rejected') {
        eventBus.emit('vehicle:rejected', {
          vehicle: updated,
          userId: updated.user,
          reason: updateData.rejection_reason || '',
        });
      }
    }

    return updated;
  }

  async delete(id, requestUser) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundError('Xe');

    const isAdmin = ['admin', 'moderator'].includes(requestUser.role);
    const isOwner = vehicle.user.toString() === requestUser._id.toString();
    if (!isAdmin && !isOwner) throw new ForbiddenError('Bạn không có quyền xoá xe này');

    await vehicleRepository.deleteById(id);
    logger.info('Vehicle deleted', { vehicleId: id, userId: requestUser._id });
  }

  async getByUser(userId) {
    return vehicleRepository.findByUser(userId);
  }

  async getForAdmin(query = {}, requestUser) {
    if (requestUser.role !== 'admin') throw new ForbiddenError('Không có quyền truy cập');

    const { search, type, status, seller, page = 1, limit = 10 } = query;
    const filters = {};

    if (type && type !== 'all') filters.type = type;
    if (status && status !== 'all') filters.status = status;
    if (seller && seller !== 'all') filters.user = seller;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { car_id: { $regex: search, $options: 'i' } },
        { license_plate: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await vehicleRepository.findForAdmin(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return {
      vehicles: result.data,
      pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    };
  }

  async getByType(type) {
    return vehicleRepository.find({ type }, { sort: { created_at: -1 }, populate: { path: 'user', select: 'full_name email phone_number avatar_url rating' } });
  }

  async quickSearch(query) {
    return vehicleRepository.quickSearch(query);
  }

  async uploadImages(files, userId) {
    const urls = files.map(file => file.path);
    logger.info('Vehicle images uploaded', { count: urls.length, userId });
    return urls;
  }
}

module.exports = new VehicleService();