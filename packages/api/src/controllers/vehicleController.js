const Vehicle = require('../models/Vehicle');
const notificationUtil = require('../utils/notificationUtil');
const logger = require('../utils/logger');

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Missing request body' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create a basic vehicle object WITHOUT any images or large data
    const basicVehicleData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      make: req.body.make,
      model: req.body.model, 
      year: req.body.year,
      price: req.body.price,
      location: req.body.location,
      user: req.user._id,
      status: 'pending',
      // Include other basic fields
      mileage: req.body.mileage || 0,
      body_type: req.body.body_type || 'Other',
      fuel_type: req.body.fuel_type || 'Other',
      transmission: req.body.transmission || 'Other',
      // Empty placeholder for images
      images: []
    };

    try {
      const vehicle = await Vehicle.create(basicVehicleData);
      logger.info('Vehicle created', { vehicleId: vehicle._id, userId: req.user._id });
      
      return res.status(201).json({
        _id: vehicle._id,
        title: vehicle.title,
        message: 'Vehicle created successfully'
      });
    } catch (dbError) {
      logger.error('Database error creating vehicle', { error: dbError.message });
      
      if (dbError.name === 'ValidationError') {
        const fields = Object.keys(dbError.errors);
        console.error('Validation failed for fields:', fields);
        return res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ',
          fields
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    logger.error('Error creating vehicle', { error: error.message });
    
    // Kiểm tra cụ thể lỗi từ mongoose để trả về thông báo phù hợp
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: 'Trùng lặp dữ liệu', 
        field: Object.keys(error.keyValue)[0] 
      });
    }
    
    next(error);
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getAllVehicles = async (req, res) => {
  try {
    const { 
      type, 
      brand, 
      minPrice, 
      maxPrice, 
      condition, 
      location,
      page = 1,
      limit = 10
    } = req.query;
    
    const filters = {};
    
    if (type) filters.type = type;
    if (brand) filters.brand = brand;
    if (condition) filters.condition = condition;
    if (location) filters.location = location;
    
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Vehicle.countDocuments(filters);
    
    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filters)
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Send response with pagination data
    res.json({
      vehicles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vehicles by type
// @route   GET /api/vehicles/type/:type
// @access  Public
exports.getVehiclesByType = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ type: req.params.type })
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('user', 'full_name email phone_number avatar_url rating');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Kiểm tra xem người dùng có phải là chủ xe hoặc là admin không
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    const isOwner = vehicle.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    const oldStatus = vehicle.status;
    const newStatus = req.body.status;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', '_id');

    // Gửi thông báo nếu trạng thái xe thay đổi và người dùng là admin/moderator
    if (isAdmin && oldStatus !== newStatus && updatedVehicle.user) {
      if (newStatus === 'approved') {
        await notificationUtil.sendVehicleApprovedNotification(updatedVehicle, updatedVehicle.user._id);
      } else if (newStatus === 'rejected') {
        const reason = req.body.rejection_reason || '';
        await notificationUtil.sendVehicleRejectedNotification(updatedVehicle, updatedVehicle.user._id, reason);
      }
    }

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload vehicle images
// @route   POST /api/vehicles/upload
// @access  Private
exports.uploadVehicleImages = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'Please upload files' });
    }

    const urls = req.files.map(file => file.path);
    logger.info('Vehicle images uploaded', { count: urls.length, userId: req.user?._id });
    res.json({ urls });
  } catch (error) {
    logger.error('Upload error', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user vehicles
// @route   GET /api/vehicles/user
// @access  Private
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id })
      .populate('user', 'full_name email phone_number avatar_url rating');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vehicles for admin dashboard
// @route   GET /api/vehicles/admin
// @access  Private (Admin only)
exports.getVehiclesForAdmin = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      status,
      seller,
      page = 1,
      limit = 10
    } = req.query;
    
    // Xác thực người dùng là admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Không có quyền truy cập trang này' 
      });
    }
    
    const filters = {};
    
    // Lọc theo loại xe
    if (type && type !== 'all') {
      filters.type = type;
    }
    
    // Lọc theo trạng thái
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    // Lọc theo người bán (user ID)
    if (seller && seller !== 'all') {
      filters.user = seller;
    }

    // Tìm kiếm theo tiêu đề, mã xe, biển số xe
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { car_id: { $regex: search, $options: 'i' } },
        { license_plate: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    // Thiết lập phân trang
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Lấy tổng số lượng xe phù hợp với bộ lọc
    const total = await Vehicle.countDocuments(filters);
    
    // Lấy danh sách xe với phân trang
    const vehicles = await Vehicle.find(filters)
      .populate('user', 'full_name email phone_number avatar_url')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);

    // Trả về kết quả
    res.json({
      vehicles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching admin vehicles', { error: error.message });
    res.status(500).json({ message: error.message });
  }
}; 