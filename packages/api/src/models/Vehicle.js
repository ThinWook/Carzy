const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic identification
  car_id: {
    type: String,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Vehicle type
  type: {
    type: String,
    enum: ['car', 'motorcycle', 'bicycle', 'truck', 'other'],
    required: true
  },
  
  // Basic vehicle details
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Vehicle specifications
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: function() {
      return this.type === 'car' || this.type === 'motorcycle' || this.type === 'truck';
    }
  },
  body_type: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Other',
           'Xe số', 'Xe tay ga', 'Xe côn tay', 'Xe thể thao', 'Xe phân khối lớn',
           'Đường phố', 'Đua', 'Địa hình', 'Gấp', 'Trẻ em', 'Fixgear', 'Điện'],
    required: function() {
      return this.type === 'car' || this.type === 'bicycle';
    }
  },
  fuel_type: {
    type: String,
    enum: ['Xăng', 'Dầu', 'Hybrid', 'Điện', 'LPG', 'Other'],
    required: function() {
      return this.type === 'car' || this.type === 'truck';
    }
  },
  transmission: {
    type: String,
    enum: ['Số sàn', 'Số tự động', 'CVT', 'Bán tự động', 'DCT', 'Other'],
    required: function() {
      return this.type === 'car';
    }
  },
  engine_capacity: {
    type: String
  },
  license_plate: {
    type: String
  },
  vin: {
    type: String
  },
  payload: {
    type: Number
  },
  
  // Visual content
  images: [{
    type: String
  }],
  video_url: {
    type: String
  },
  registration_papers: {
    type: String
  },
  inspection_papers: {
    type: String
  },
  
  // Pricing and location
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'VND'
  },
  location: {
    type: String,
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'removed'],
    default: 'pending'
  },
  verification_level: {
    type: String,
    enum: ['basic', 'verified', 'certified'],
    default: 'basic'
  },
  views_count: {
    type: Number,
    default: 0
  },
  
  // Date tracking
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  sold_at: {
    type: Date
  },
  
  // Additional details that might be useful to keep from the original schema
  features: [{
    type: String
  }]
});

// Update the updated_at field on save
vehicleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes để tăng tốc truy vấn
vehicleSchema.index({ type: 1, status: 1 });        // Lọc xe theo loại + trạng thái
vehicleSchema.index({ make: 1, model: 1 });          // Lọc theo hãng + model
vehicleSchema.index({ price: 1 });                   // Sort/filter theo giá
vehicleSchema.index({ user: 1, status: 1 });         // Xe của người dùng
vehicleSchema.index({ location: 1 });                // Lọc theo địa điểm
vehicleSchema.index(                                  // Full-text search
  { title: 'text', make: 'text', model: 'text', description: 'text' },
  { name: 'vehicle_text_search' }
);

module.exports = mongoose.model('Vehicle', vehicleSchema); 