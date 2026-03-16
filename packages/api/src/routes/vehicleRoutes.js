const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { verifiedKyc } = require('../middleware/verifiedKyc');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Vehicle = require('../models/Vehicle');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'used-vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const upload = multer({ storage: storage });

// Import vehicle controller
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehiclesByType,
  uploadVehicleImages,
  getUserVehicles,
  getVehiclesForAdmin
} = require('../controllers/vehicleController');

const { createVehicleValidators } = require('../middleware/validators/vehicleValidators');

// Thêm một controller mới để lấy phương tiện theo ID người dùng (cho admin)
const userVehiclesByIdController = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const vehicles = await Vehicle.find({ user: userId })
      .populate('user', 'full_name email phone_number avatar_url rating');
    
    res.json({ vehicles });
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    res.status(500).json({ message: error.message });
  }
};

// Routes
router.route('/')
  .get(getAllVehicles)
  .post(protect, verifiedKyc, createVehicleValidators, createVehicle);

router.route('/user')
  .get(protect, getUserVehicles);

// Thêm route mới để lấy phương tiện của người dùng theo ID (cho admin)
router.route('/user/:userId')
  .get(protect, userVehiclesByIdController);

router.route('/search')
  .get(getAllVehicles);

router.route('/type/:type')
  .get(getVehiclesByType);

router.route('/upload')
  .post(protect, verifiedKyc, upload.array('images', 10), uploadVehicleImages);

// Thêm route để lấy danh sách xe cho admin
router.route('/admin')
  .get(protect, getVehiclesForAdmin);

// Thêm route để cập nhật trạng thái xe cho admin
router.route('/admin/:id/status')
  .put(protect, async (req, res) => {
    try {
      // Xác thực quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected', 'sold', 'hidden'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Không tìm thấy xe' });
      }
      
      vehicle.status = status;
      await vehicle.save();
      
      res.json({ message: 'Cập nhật trạng thái thành công', vehicle });
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      res.status(500).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

module.exports = router; 